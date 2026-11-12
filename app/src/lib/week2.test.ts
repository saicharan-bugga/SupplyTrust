import { describe, expect, it } from 'vitest'
import { sampleData } from '../data/sample'
import { createOrder, saveVendor, toggleVendorStatus, updateOrder } from './orders'
import { orderSchema, vendorSchema } from './orderSchema'
import { ALLOWED_TRANSITIONS, applyTransition, canRoleTransition, canTransition, isEditable, nextOrderId } from './transitions'

const values = {
  vendorId: 'v1',
  expectedDeliveryDate: '2026-12-01',
  items: [{ itemId: '', productName: 'Widget', sku: 'W-1', orderedQuantity: 5, unitPrice: 10 }],
}

describe('orderSchema', () => {
  it('accepts a valid order', () => expect(orderSchema.safeParse(values).success).toBe(true))
  it('rejects an order with no items', () => expect(orderSchema.safeParse({ ...values, items: [] }).success).toBe(false))
  it('rejects zero, negative and fractional quantities', () => {
    for (const q of [0, -3, 1.5]) {
      expect(orderSchema.safeParse({ ...values, items: [{ ...values.items[0], orderedQuantity: q }] }).success).toBe(false)
    }
  })
  it('rejects negative price but allows zero', () => {
    expect(orderSchema.safeParse({ ...values, items: [{ ...values.items[0], unitPrice: -1 }] }).success).toBe(false)
    expect(orderSchema.safeParse({ ...values, items: [{ ...values.items[0], unitPrice: 0 }] }).success).toBe(true)
  })
  it('requires a vendor and a delivery date', () => {
    expect(orderSchema.safeParse({ ...values, vendorId: '' }).success).toBe(false)
    expect(orderSchema.safeParse({ ...values, expectedDeliveryDate: '' }).success).toBe(false)
  })
})

describe('vendorSchema', () => {
  it('validates email and contact', () => {
    expect(vendorSchema.safeParse({ name: 'Acme', email: 'a@b.co', contact: '+91 99999' }).success).toBe(true)
    expect(vendorSchema.safeParse({ name: 'Acme', email: 'nope', contact: '+91 99999' }).success).toBe(false)
  })
})

describe('status transitions', () => {
  it('allows valid and blocks invalid moves', () => {
    expect(canTransition('Draft', 'Pending Approval')).toBe(true)
    expect(canTransition('Draft', 'Received')).toBe(false)
    expect(canTransition('Cancelled', 'Draft')).toBe(false)
  })
  it('terminal states have no exits', () => {
    expect(ALLOWED_TRANSITIONS.Received).toEqual([])
    expect(ALLOWED_TRANSITIONS.Cancelled).toEqual([])
  })
  it('only Draft and Pending Approval are editable', () => {
    expect(isEditable({ ...sampleData.orders[0], status: 'Draft' })).toBe(true)
    expect(isEditable({ ...sampleData.orders[0], status: 'Ordered' })).toBe(false)
  })
  it('role rules: vendors cannot approve, managers can', () => {
    expect(canRoleTransition('vendor', 'Approved')).toBe(false)
    expect(canRoleTransition('procurement_manager', 'Approved')).toBe(true)
  })
  it('applyTransition records history and throws on invalid moves', () => {
    const created = createOrder(sampleData, values, 'u1', 'Draft')
    const next = applyTransition(created.data, created.orderId, 'Pending Approval', 'u1')
    const h = next.history.filter((x) => x.orderId === created.orderId)
    expect(h).toHaveLength(2)
    expect(h[1]).toMatchObject({ previousStatus: 'Draft', newStatus: 'Pending Approval', changedBy: 'u1' })
    expect(() => applyTransition(created.data, created.orderId, 'Received', 'u1')).toThrow()
  })
})

describe('order and vendor operations', () => {
  it('generates the next sequential order id', () => {
    expect(nextOrderId([{ ...sampleData.orders[0], orderId: 'PO-2026-009' }], 2026)).toBe('PO-2026-010')
  })
  it('createOrder adds the order and a first history entry', () => {
    const { data, orderId } = createOrder(sampleData, values, 'u1', 'Pending Approval')
    expect(data.orders.find((o) => o.orderId === orderId)?.status).toBe('Pending Approval')
    expect(data.history.at(-1)).toMatchObject({ orderId, previousStatus: null })
  })
  it('updateOrder edits a draft but refuses an ordered order', () => {
    const { data, orderId } = createOrder(sampleData, values, 'u1')
    const edited = updateOrder(data, orderId, { ...values, expectedDeliveryDate: '2027-01-01' })
    expect(edited.orders.find((o) => o.orderId === orderId)?.expectedDeliveryDate).toBe('2027-01-01')
    const ordered = sampleData.orders.find((o) => o.status === 'Ordered')!
    expect(() => updateOrder(sampleData, ordered.orderId, values)).toThrow()
  })
  it('saveVendor adds with a new id, edits, and toggles status', () => {
    const added = saveVendor(sampleData, { name: 'New Vendor', email: 'n@v.co', contact: '12345' })
    expect(added.vendors).toHaveLength(sampleData.vendors.length + 1)
    const id = added.vendors.at(-1)!.vendorId
    expect(toggleVendorStatus(added, id).vendors.find((v) => v.vendorId === id)?.status).toBe('Inactive')
    const renamed = saveVendor(added, { name: 'Renamed', email: 'n@v.co', contact: '12345' }, id)
    expect(renamed.vendors.find((v) => v.vendorId === id)?.name).toBe('Renamed')
  })
})
