import { describe, expect, it } from 'vitest'
import { sampleData } from '../data/sample'
import {
  awaitingDecision,
  canReceive,
  completeInspection,
  defectBreakdown,
  outcomeFor,
  outstandingByItem,
  recordDecision,
  recordReceipt,
  updateEta,
  validateInspection,
  validateReceipt,
  vendorPerformance,
} from './workflow'

const order = (id: string) => sampleData.orders.find((o) => o.orderId === id)!
const ordered = order('PO-2026-003') // Ordered, 2500 cotton fabric

describe('goods receipt', () => {
  it('computes outstanding quantity per item from earlier receipts', () => {
    expect(outstandingByItem(sampleData, order('PO-2026-002'))).toEqual({ i3: 400, i4: 0 })
  })
  it('only Ordered / Partially Received orders can receive goods', () => {
    expect(canReceive(order('PO-2026-003'))).toBe(true)
    expect(canReceive(order('PO-2026-007'))).toBe(false) // cancelled
    expect(canReceive(order('PO-2026-001'))).toBe(false) // received
  })
  it('rejects over-receipt, negatives, fractions and empty receipts', () => {
    expect(validateReceipt(sampleData, ordered, { i5: 3000 }).i5).toMatch(/outstanding/)
    expect(validateReceipt(sampleData, ordered, { i5: -1 }).i5).toBeTruthy()
    expect(validateReceipt(sampleData, ordered, { i5: 1.5 }).i5).toBeTruthy()
    expect(validateReceipt(sampleData, ordered, { i5: 0 })._form).toBeTruthy()
  })
  it('partial receipt moves to Partially Received and opens a pending inspection', () => {
    const next = recordReceipt(sampleData, 'PO-2026-003', { i5: 1000 }, 'first lot', 'u4')
    expect(next.orders.find((o) => o.orderId === 'PO-2026-003')?.status).toBe('Partially Received')
    const pending = next.inspections.filter((i) => i.orderId === 'PO-2026-003')
    expect(pending).toHaveLength(1)
    expect(pending[0]).toMatchObject({ outcome: 'Pending Inspection', inspectedQuantity: 1000 })
    expect(next.history.at(-1)).toMatchObject({ previousStatus: 'Ordered', newStatus: 'Partially Received', changedBy: 'u4' })
  })
  it('full receipt moves to Received', () => {
    const next = recordReceipt(sampleData, 'PO-2026-003', { i5: 2500 }, '', 'u4')
    expect(next.orders.find((o) => o.orderId === 'PO-2026-003')?.status).toBe('Received')
  })
  it('refuses a receipt on a cancelled order', () => {
    expect(() => recordReceipt(sampleData, 'PO-2026-007', { i9: 10 }, '', 'u4')).toThrow(/cannot accept/)
  })
})

describe('inspection', () => {
  const pending = sampleData.inspections.find((i) => i.inspectionId === 'q3')!
  it('accepted + rejected must equal inspected', () => {
    expect(validateInspection(pending, { acceptedQuantity: 300, rejectedQuantity: 50, notes: '', defects: [] })._form).toMatch(/must equal/)
  })
  it('rejected units need matching defect records', () => {
    expect(validateInspection(pending, { acceptedQuantity: 350, rejectedQuantity: 50, notes: '', defects: [] }).defects).toBeTruthy()
    expect(validateInspection(pending, { acceptedQuantity: 350, rejectedQuantity: 50, notes: '', defects: [{ category: 'Damage', quantity: 20, description: '' }] }).defects).toMatch(/add up/)
    expect(validateInspection(pending, { acceptedQuantity: 350, rejectedQuantity: 50, notes: '', defects: [{ category: 'Damage', quantity: 50, description: '' }] })).toEqual({})
  })
  it('outcome: failed at 10% or more rejected', () => {
    expect(outcomeFor(100, 0)).toBe('Passed')
    expect(outcomeFor(100, 9)).toBe('Passed')
    expect(outcomeFor(100, 10)).toBe('Failed')
  })
  it('completing an inspection stores outcome and defects, and cannot be repeated', () => {
    const next = completeInspection(sampleData, 'q3', { acceptedQuantity: 300, rejectedQuantity: 100, notes: 'x', defects: [{ category: 'Damage', quantity: 100, description: 'dented' }] }, 'u3')
    const q = next.inspections.find((i) => i.inspectionId === 'q3')!
    expect(q.outcome).toBe('Failed')
    expect(q.defects).toHaveLength(1)
    expect(() => completeInspection(next, 'q3', { acceptedQuantity: 400, rejectedQuantity: 0, notes: '', defects: [] }, 'u3')).toThrow(/already/)
  })
})

describe('approval decisions', () => {
  it('queue holds completed inspections without a decision', () => {
    const queue = sampleData.inspections.filter((i) => awaitingDecision(sampleData, i)).map((i) => i.inspectionId)
    expect(queue).toEqual(['q2']) // q1 already decided, q3 not yet inspected
  })
  it('rejection and failed-approval require a comment', () => {
    expect(() => recordDecision(sampleData, 'q2', 'Rejected', '', 'u1')).toThrow(/comment/)
    expect(() => recordDecision(sampleData, 'q2', 'Approved', '', 'u1')).toThrow(/comment/)
  })
  it('records a decision with approver and time, then leaves the queue', () => {
    const next = recordDecision(sampleData, 'q2', 'Rejected', 'Crushed cartons, return to vendor', 'u1')
    expect(next.approvals.at(-1)).toMatchObject({ inspectionId: 'q2', decision: 'Rejected', approverId: 'u1' })
    expect(next.inspections.filter((i) => awaitingDecision(next, i))).toHaveLength(0)
    expect(() => recordDecision(next, 'q2', 'Approved', 'second try ok', 'u1')).toThrow(/not awaiting/)
  })
  it('a failed inspection never auto-accepts the whole order: status is unchanged by a decision', () => {
    const before = sampleData.orders.find((o) => o.orderId === 'PO-2026-002')!.status
    const next = recordDecision(sampleData, 'q2', 'Approved', 'Accept good units only', 'u1')
    expect(next.orders.find((o) => o.orderId === 'PO-2026-002')!.status).toBe(before)
  })
  it('reinspection preserves the old record and opens a new pending one', () => {
    const next = recordDecision(sampleData, 'q2', 'Reinspection Requested', 'Recount rejected cartons', 'u1')
    const all = next.inspections.filter((i) => i.orderId === 'PO-2026-002')
    expect(all).toHaveLength(2)
    expect(all.find((i) => i.inspectionId === 'q2')).toMatchObject({ outcome: 'Reinspection Required', rejectedQuantity: 180 })
    expect(all.find((i) => i.inspectionId !== 'q2')).toMatchObject({ outcome: 'Pending Inspection', inspectedQuantity: 720 })
  })
})

describe('vendor updates and reports', () => {
  it('updates the delivery date only for open orders and logs it', () => {
    const next = updateEta(sampleData, 'PO-2026-003', '2026-12-20', 'u5')
    expect(next.orders.find((o) => o.orderId === 'PO-2026-003')?.expectedDeliveryDate).toBe('2026-12-20')
    expect(next.audit.at(-1)).toMatchObject({ action: 'Delivery date updated', actorId: 'u5' })
    expect(() => updateEta(sampleData, 'PO-2026-007', '2026-12-20', 'u5')).toThrow()
  })
  it('vendor performance is derived and bounded 0-100', () => {
    const perf = vendorPerformance(sampleData, new Date('2026-11-12'))
    expect(perf).toHaveLength(sampleData.vendors.length)
    perf.forEach((p) => {
      expect(p.score).toBeGreaterThanOrEqual(0)
      expect(p.score).toBeLessThanOrEqual(100)
    })
    expect(perf.find((p) => p.vendorId === 'v2')!.rejectionRate).toBeGreaterThan(0.1)
  })
  it('defect breakdown totals by category', () => {
    expect(defectBreakdown(sampleData)).toEqual([
      { category: 'Damage', quantity: 180 },
      { category: 'Dimensional', quantity: 10 },
    ])
  })
})
