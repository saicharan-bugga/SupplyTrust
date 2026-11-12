import type { AppData, ApprovalRecord, InspectionDefect, InspectionOutcome, PurchaseOrder, QualityInspection } from '../types'
import { applyTransition } from './transitions'

/** Share of rejected units at or above which an inspection is marked Failed. */
export const FAIL_THRESHOLD = 0.1

let seq = 0
const uid = (prefix: string, now: Date) => `${prefix}-${now.getTime()}-${seq++}`

export const audit = (data: AppData, actorId: string, action: string, detail: string, orderId?: string, now = new Date()): AppData => ({
  ...data,
  audit: [...data.audit, { auditId: uid('au', now), orderId, actorId, action, detail, at: now.toISOString() }],
})

/* ---------------------------------------------------------------- receipts */

/** Quantity still to be received for every item of an order (ordered minus all earlier receipts). */
export function outstandingByItem(data: AppData, order: PurchaseOrder): Record<string, number> {
  const got: Record<string, number> = {}
  data.receipts
    .filter((r) => r.orderId === order.orderId)
    .forEach((r) => r.receivedItems.forEach((i) => (got[i.itemId] = (got[i.itemId] ?? 0) + i.receivedQuantity)))
  return Object.fromEntries(order.items.map((i) => [i.itemId, Math.max(0, i.orderedQuantity - (got[i.itemId] ?? 0))]))
}

export const canReceive = (o: PurchaseOrder): boolean => o.status === 'Ordered' || o.status === 'Partially Received'

/** Returns a map of itemId -> error message. Empty when valid (rule 3: received qty reconciled with ordered). */
export function validateReceipt(data: AppData, order: PurchaseOrder, qty: Record<string, number>): Record<string, string> {
  const errors: Record<string, string> = {}
  const left = outstandingByItem(data, order)
  let total = 0
  for (const item of order.items) {
    const q = qty[item.itemId] ?? 0
    if (!Number.isInteger(q) || q < 0) errors[item.itemId] = 'Enter a whole number, 0 or more'
    else if (q > left[item.itemId]) errors[item.itemId] = `Only ${left[item.itemId]} still outstanding`
    else total += q
  }
  if (Object.keys(errors).length === 0 && total === 0) errors._form = 'Enter a received quantity for at least one item'
  return errors
}

export function recordReceipt(
  data: AppData,
  orderId: string,
  qty: Record<string, number>,
  notes: string,
  userId: string,
  now = new Date(),
): AppData {
  const order = data.orders.find((o) => o.orderId === orderId)
  if (!order) throw new Error('Order not found')
  if (!canReceive(order)) throw new Error(`${order.orderId} is ${order.status} and cannot accept a goods receipt`)
  const errors = validateReceipt(data, order, qty)
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])

  const receivedItems = order.items.filter((i) => (qty[i.itemId] ?? 0) > 0).map((i) => ({ itemId: i.itemId, receivedQuantity: qty[i.itemId] }))
  const units = receivedItems.reduce((s, i) => s + i.receivedQuantity, 0)
  const receiptId = uid('r', now)
  let next: AppData = {
    ...data,
    receipts: [...data.receipts, { receiptId, orderId, receivedItems, receivedAt: now.toISOString(), notes }],
    // Every receipt creates a pending inspection for exactly the units that arrived.
    inspections: [
      ...data.inspections,
      {
        inspectionId: uid('q', now),
        orderId,
        inspectedQuantity: units,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        outcome: 'Pending Inspection',
        notes: '',
        defects: [],
        inspectedAt: now.toISOString(),
      },
    ],
  }
  const stillOpen = Object.values(outstandingByItem(next, order)).some((n) => n > 0)
  next = applyTransition(next, orderId, stillOpen ? 'Partially Received' : 'Received', userId, now)
  return audit(next, userId, 'Goods received', `${units} units received${notes ? ` - ${notes}` : ''}`, orderId, now)
}

/* ------------------------------------------------------------- inspections */

export interface InspectionInput {
  acceptedQuantity: number
  rejectedQuantity: number
  notes: string
  defects: { category: string; quantity: number; description: string }[]
}

export function validateInspection(inspection: QualityInspection, input: InspectionInput): Record<string, string> {
  const errors: Record<string, string> = {}
  const { acceptedQuantity: a, rejectedQuantity: r } = input
  if (!Number.isInteger(a) || a < 0) errors.accepted = 'Enter a whole number, 0 or more'
  if (!Number.isInteger(r) || r < 0) errors.rejected = 'Enter a whole number, 0 or more'
  if (!errors.accepted && !errors.rejected && a + r !== inspection.inspectedQuantity) {
    errors._form = `Accepted + rejected must equal the ${inspection.inspectedQuantity} units inspected (currently ${a + r})`
  }
  if (!errors.rejected && r > 0) {
    if (input.defects.length === 0) errors.defects = 'Record at least one defect for the rejected units'
    else if (input.defects.some((d) => !d.category.trim())) errors.defects = 'Every defect needs a category'
    else if (input.defects.reduce((s, d) => s + d.quantity, 0) !== r) errors.defects = 'Defect quantities must add up to the rejected units'
  }
  return errors
}

export const outcomeFor = (inspected: number, rejected: number): InspectionOutcome =>
  rejected === 0 || rejected / inspected < FAIL_THRESHOLD ? 'Passed' : 'Failed'

export function completeInspection(data: AppData, inspectionId: string, input: InspectionInput, userId: string, now = new Date()): AppData {
  const insp = data.inspections.find((i) => i.inspectionId === inspectionId)
  if (!insp) throw new Error('Inspection not found')
  if (insp.outcome !== 'Pending Inspection') throw new Error('This inspection has already been recorded')
  const errors = validateInspection(insp, input)
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
  const order = data.orders.find((o) => o.orderId === insp.orderId)
  if (order?.status === 'Cancelled') throw new Error('Cancelled orders accept no further updates')

  const defects: InspectionDefect[] = input.defects.map((d, n) => ({ defectId: uid(`d${n}`, now), inspectionId, ...d }))
  const outcome = outcomeFor(insp.inspectedQuantity, input.rejectedQuantity)
  const done: QualityInspection = {
    ...insp,
    acceptedQuantity: input.acceptedQuantity,
    rejectedQuantity: input.rejectedQuantity,
    notes: input.notes,
    defects: input.rejectedQuantity > 0 ? defects : [],
    outcome,
    inspectedAt: now.toISOString(),
  }
  return audit(
    { ...data, inspections: data.inspections.map((i) => (i.inspectionId === inspectionId ? done : i)) },
    userId,
    'Inspection recorded',
    `${outcome}: ${input.acceptedQuantity} accepted, ${input.rejectedQuantity} rejected`,
    insp.orderId,
    now,
  )
}

/* --------------------------------------------------------------- approvals */

export type Decision = ApprovalRecord['decision']

export const decisionFor = (data: AppData, inspectionId: string): ApprovalRecord | undefined =>
  data.approvals.filter((a) => a.inspectionId === inspectionId).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0]

/** An inspection awaits a decision when it is completed (Passed/Failed) and has no recorded decision. */
export const awaitingDecision = (data: AppData, i: QualityInspection): boolean =>
  (i.outcome === 'Passed' || i.outcome === 'Failed') && !decisionFor(data, i.inspectionId)

export function recordDecision(
  data: AppData,
  inspectionId: string,
  decision: Decision,
  comments: string,
  approverId: string,
  now = new Date(),
): AppData {
  const insp = data.inspections.find((i) => i.inspectionId === inspectionId)
  if (!insp) throw new Error('Inspection not found')
  if (!awaitingDecision(data, insp)) throw new Error('This inspection is not awaiting a decision')
  const text = comments.trim()
  if (decision !== 'Approved' && text.length < 5) throw new Error('Add a comment (at least 5 characters) explaining this decision')
  if (decision === 'Approved' && insp.outcome === 'Failed' && text.length < 5) {
    throw new Error('Approving a failed inspection needs a comment explaining why')
  }

  let next: AppData = {
    ...data,
    approvals: [...data.approvals, { approvalId: uid('a', now), inspectionId, decision, approverId, comments: text, decidedAt: now.toISOString() }],
  }
  if (decision === 'Reinspection Requested') {
    // Rule 7: the old record is preserved (marked Reinspection Required) and a fresh pending inspection is opened.
    next = {
      ...next,
      inspections: [
        ...next.inspections.map((i) => (i.inspectionId === inspectionId ? { ...i, outcome: 'Reinspection Required' as const } : i)),
        { ...insp, inspectionId: uid('q', now), acceptedQuantity: 0, rejectedQuantity: 0, outcome: 'Pending Inspection', notes: '', defects: [], inspectedAt: now.toISOString() },
      ],
    }
  }
  return audit(next, approverId, `Inspection ${decision.toLowerCase()}`, text || 'No comment', insp.orderId, now)
}

/* ----------------------------------------------------------- vendor updates */

export function updateEta(data: AppData, orderId: string, date: string, userId: string, now = new Date()): AppData {
  const order = data.orders.find((o) => o.orderId === orderId)
  if (!order) throw new Error('Order not found')
  if (!canReceive(order)) throw new Error('Delivery dates can only change while an order is Ordered or Partially Received')
  if (!date) throw new Error('Choose a new delivery date')
  return audit(
    { ...data, orders: data.orders.map((o) => (o.orderId === orderId ? { ...o, expectedDeliveryDate: date } : o)) },
    userId,
    'Delivery date updated',
    `${order.expectedDeliveryDate} to ${date}`,
    orderId,
    now,
  )
}

/* ----------------------------------------------------------------- reports */

export interface VendorPerformance {
  vendorId: string
  name: string
  orders: number
  value: number
  onTimeRate: number | null
  rejectionRate: number
  score: number
}

/** Vendor scorecard: on-time = received orders not overdue; quality = 1 - rejection rate. Derived, never stored. */
export function vendorPerformance(data: AppData, now = new Date()): VendorPerformance[] {
  return data.vendors.map((v) => {
    const orders = data.orders.filter((o) => o.vendorId === v.vendorId && o.status !== 'Cancelled' && o.status !== 'Draft')
    const ids = new Set(orders.map((o) => o.orderId))
    const insp = data.inspections.filter((i) => ids.has(i.orderId) && (i.outcome === 'Passed' || i.outcome === 'Failed'))
    const inspected = insp.reduce((s, i) => s + i.inspectedQuantity, 0)
    const rejected = insp.reduce((s, i) => s + i.rejectedQuantity, 0)
    const trackable = orders.filter((o) => o.status !== 'Pending Approval' && o.status !== 'Approved')
    const late = trackable.filter((o) => new Date(o.expectedDeliveryDate) < new Date(now.toDateString()) && o.status !== 'Received').length
    const onTime = trackable.length ? 1 - late / trackable.length : null
    const rej = inspected ? rejected / inspected : 0
    const value = orders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.orderedQuantity * i.unitPrice, 0), 0)
    const score = Math.round(((onTime ?? 1) * 0.5 + (1 - rej) * 0.5) * 100)
    return { vendorId: v.vendorId, name: v.name, orders: orders.length, value, onTimeRate: onTime, rejectionRate: rej, score }
  })
}

export const defectBreakdown = (data: AppData): { category: string; quantity: number }[] => {
  const m = new Map<string, number>()
  data.inspections.forEach((i) => i.defects.forEach((d) => m.set(d.category, (m.get(d.category) ?? 0) + d.quantity)))
  return [...m.entries()].map(([category, quantity]) => ({ category, quantity })).sort((a, b) => b.quantity - a.quantity)
}
