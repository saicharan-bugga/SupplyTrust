import { describe, expect, it } from 'vitest'
import { sampleData } from '../data/sample'
import { dashboardStats, delayDays, isDelayed, orderTotal, outstandingQuantity, rejectionRate } from './derived'

const today = new Date('2026-11-11')

describe('derived values', () => {
  it('computes order total from items', () => {
    expect(orderTotal(sampleData.orders[0])).toBe(200 * 450 + 500 * 35)
  })

  it('flags open orders past their expected date as delayed', () => {
    const ordered = sampleData.orders.find((o) => o.orderId === 'PO-2026-003')!
    expect(isDelayed(ordered, today)).toBe(true)
    expect(delayDays(ordered, today)).toBe(9)
  })

  it('never flags received, cancelled or draft orders as delayed', () => {
    for (const id of ['PO-2026-001', 'PO-2026-007', 'PO-2026-005']) {
      expect(isDelayed(sampleData.orders.find((o) => o.orderId === id)!, today)).toBe(false)
    }
  })

  it('computes outstanding quantity from receipts', () => {
    const o = sampleData.orders.find((x) => x.orderId === 'PO-2026-002')!
    expect(outstandingQuantity(sampleData, o)).toBe(1120 - 720)
  })

  it('computes rejection rate', () => {
    expect(rejectionRate([])).toBe(0)
    expect(rejectionRate([sampleData.inspections[1]])).toBeCloseTo(0.25)
  })

  it('builds dashboard stats from records', () => {
    const s = dashboardStats(sampleData)
    expect(s.totalOrders).toBe(8)
    expect(s.pendingApprovals).toBe(1)
    expect(s.inspectionFailures).toBe(1)
  })
})
