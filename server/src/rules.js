// Server-side enforcement of the SupplyTrust workflow rules (PRD rule 10).
// The client keeps the same rules for instant feedback; the server is the authority.

export const MATRIX = {
  procurement_officer: ['order.create', 'order.edit', 'order.cancel', 'inspection.decide', 'vendor.manage', 'reports.view', 'audit.view'],
  procurement_manager: ['reports.view', 'inspection.decide', 'audit.view'],
  vendor: ['order.updateFulfillment'],
  quality_inspector: ['inspection.record'],
  warehouse_receiver: ['receipt.record'],
}

export const ALLOWED_TRANSITIONS = {
  Draft: ['Pending Approval', 'Cancelled'],
  'Pending Approval': ['Approved', 'Draft', 'Cancelled'],
  Approved: ['Ordered', 'Cancelled'],
  Ordered: ['Partially Received', 'Received', 'Cancelled'],
  'Partially Received': ['Partially Received', 'Received', 'Cancelled'],
  Received: [],
  Cancelled: [],
}

export const can = (role, permission) => (MATRIX[role] ?? []).includes(permission)

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const KEYS = {
  orders: 'orderId',
  vendors: 'vendorId',
  receipts: 'receiptId',
  inspections: 'inspectionId',
  approvals: 'approvalId',
  history: 'historyId',
  audit: 'auditId',
  users: 'userId',
}

/** Returns the added/changed/removed records of one collection. */
export function diffCollection(collection, before = [], after = []) {
  const k = KEYS[collection]
  const prev = new Map(before.map((r) => [r[k], r]))
  const next = new Map(after.map((r) => [r[k], r]))
  return {
    added: after.filter((r) => !prev.has(r[k])),
    removed: before.filter((r) => !next.has(r[k])),
    changed: after.filter((r) => prev.has(r[k]) && !same(prev.get(r[k]), r)).map((r) => ({ before: prev.get(r[k]), after: r })),
  }
}

function validOrder(o) {
  if (!Array.isArray(o.items) || o.items.length === 0) return 'An order needs at least one item (rule 1)'
  for (const i of o.items) {
    if (!Number.isInteger(i.orderedQuantity) || i.orderedQuantity <= 0) return 'Quantities must be positive whole numbers (rule 2)'
    if (typeof i.unitPrice !== 'number' || i.unitPrice < 0) return 'Unit price cannot be negative (rule 2)'
  }
  return null
}

/**
 * Validate a proposed new data document against the stored one for a given user.
 * Returns an array of violation messages (empty = allowed).
 */
export function validateChange(prevData, nextData, user) {
  const errors = []
  const role = user.role
  const deny = (msg) => errors.push(msg)

  // Users cannot be added/removed; a user may only rename themselves.
  const users = diffCollection('users', prevData.users, nextData.users)
  if (users.added.length || users.removed.length) deny('Users cannot be added or removed')
  for (const c of users.changed) {
    if (c.after.userId !== user.userId) deny('You can only edit your own profile')
    else if (c.after.role !== c.before.role || c.after.vendorId !== c.before.vendorId) deny('Role cannot be changed')
  }

  // History and audit are append-only.
  for (const log of ['history', 'audit']) {
    const d = diffCollection(log, prevData[log], nextData[log])
    if (d.removed.length || d.changed.length) deny(`The ${log} log is append-only`)
  }

  // Vendors
  const vendors = diffCollection('vendors', prevData.vendors, nextData.vendors)
  if ((vendors.added.length || vendors.changed.length || vendors.removed.length) && !can(role, 'vendor.manage')) {
    deny('Your role cannot manage vendors')
  }

  // Orders
  const orders = diffCollection('orders', prevData.orders, nextData.orders)
  if (orders.removed.length) deny('Orders cannot be deleted, cancel them instead')
  for (const o of orders.added) {
    if (!can(role, 'order.create')) deny('Your role cannot create purchase orders')
    const bad = validOrder(o)
    if (bad) deny(bad)
  }
  for (const { before, after } of orders.changed) {
    if (before.status === 'Cancelled') {
      deny(`${before.orderId} is cancelled and accepts no further updates (rule 8)`)
      continue
    }
    if (role === 'vendor') {
      if (before.vendorId !== user.vendorId) {
        deny('Vendors can only update their own orders')
        continue
      }
      const { expectedDeliveryDate: _a, ...restBefore } = before
      const { expectedDeliveryDate: _b, ...restAfter } = after
      if (!same(restBefore, restAfter)) deny('Vendors may only change the expected delivery date')
      continue
    }
    if (before.status !== after.status) {
      if (!ALLOWED_TRANSITIONS[before.status].includes(after.status)) {
        deny(`Cannot change ${before.orderId} from ${before.status} to ${after.status}`)
        continue
      }
      const to = after.status
      let ok
      if (to === 'Cancelled') ok = can(role, 'order.cancel')
      else if (to === 'Partially Received' || to === 'Received') ok = can(role, 'receipt.record') || role === 'procurement_officer'
      else if (to === 'Approved') ok = role === 'procurement_manager' || role === 'procurement_officer'
      else ok = can(role, 'order.edit')
      if (!ok) deny(`Your role cannot move an order to ${to}`)
    } else if (!same(before, after)) {
      if (!can(role, 'order.edit')) deny('Your role cannot edit purchase orders')
      else if (!['Draft', 'Pending Approval'].includes(before.status)) deny('Orders can only be edited before they are sent to the vendor')
    }
    const bad = validOrder(after)
    if (bad) deny(bad)
  }

  // Receipts: recorded by the warehouse receiver (or officer), never on cancelled orders.
  const receipts = diffCollection('receipts', prevData.receipts, nextData.receipts)
  if (receipts.removed.length || receipts.changed.length) deny('Receipts cannot be edited or removed')
  for (const r of receipts.added) {
    if (!can(role, 'receipt.record') && role !== 'procurement_officer') deny('Your role cannot record goods receipts')
    const order = nextData.orders.find((o) => o.orderId === r.orderId)
    if (!order) deny('Receipt refers to an unknown order')
    else if (prevData.orders.find((o) => o.orderId === r.orderId)?.status === 'Cancelled') deny('Cancelled orders accept no receipts (rule 8)')
    else if (r.receivedItems.some((i) => !Number.isInteger(i.receivedQuantity) || i.receivedQuantity < 0)) deny('Received quantities must be whole numbers')
  }

  // Inspections: earlier records are preserved; completed ones must reconcile.
  const inspections = diffCollection('inspections', prevData.inspections, nextData.inspections)
  if (inspections.removed.length) deny('Inspection records are preserved (rule 7)')
  for (const i of [...inspections.added, ...inspections.changed.map((c) => c.after)]) {
    if (!can(role, 'inspection.record') && !can(role, 'inspection.decide') && role !== 'warehouse_receiver') deny('Your role cannot change inspections')
    if (i.outcome !== 'Pending Inspection' && i.acceptedQuantity + i.rejectedQuantity !== i.inspectedQuantity) {
      deny('Accepted plus rejected must equal inspected (rule 4)')
    }
  }

  // Approvals: append-only, authorised roles only.
  const approvals = diffCollection('approvals', prevData.approvals, nextData.approvals)
  if (approvals.removed.length || approvals.changed.length) deny('Approval decisions cannot be edited or removed')
  for (const a of approvals.added) {
    if (!can(role, 'inspection.decide')) deny('Only authorised roles can approve or reject inspections (rule 5)')
    if (a.approverId !== user.userId) deny('Decision must be recorded under your own user')
  }

  return [...new Set(errors)]
}
