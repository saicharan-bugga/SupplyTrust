import type { AppData, OrderStatus, PurchaseOrder, Vendor } from '../types'
import type { OrderFormValues, VendorFormValues } from './orderSchema'
import { nextOrderId } from './transitions'

const stamp = (now: Date, n: number) => `${now.getTime()}-${n}`

/** Create a new order (Draft or Pending Approval) and record the first history entry. */
export function createOrder(
  data: AppData,
  values: OrderFormValues,
  userId: string,
  initialStatus: Extract<OrderStatus, 'Draft' | 'Pending Approval'> = 'Draft',
  now = new Date(),
): { data: AppData; orderId: string } {
  const orderId = nextOrderId(data.orders, now.getFullYear())
  const order: PurchaseOrder = {
    orderId,
    vendorId: values.vendorId,
    items: values.items.map((i, idx) => ({ ...i, itemId: i.itemId || `i-${stamp(now, idx)}` })),
    expectedDeliveryDate: values.expectedDeliveryDate,
    status: initialStatus,
    createdAt: now.toISOString().slice(0, 10),
  }
  return {
    orderId,
    data: {
      ...data,
      orders: [...data.orders, order],
      history: [
        ...data.history,
        {
          historyId: `h-${stamp(now, data.history.length)}`,
          orderId,
          previousStatus: null,
          newStatus: initialStatus,
          changedBy: userId,
          changedAt: now.toISOString(),
        },
      ],
    },
  }
}

/** Replace the editable fields of an order that has not yet been sent to the vendor. */
export function updateOrder(data: AppData, orderId: string, values: OrderFormValues, now = new Date()): AppData {
  const existing = data.orders.find((o) => o.orderId === orderId)
  if (!existing) throw new Error('Order not found')
  if (existing.status !== 'Draft' && existing.status !== 'Pending Approval') {
    throw new Error('Only Draft or Pending Approval orders can be edited')
  }
  return {
    ...data,
    orders: data.orders.map((o) =>
      o.orderId === orderId
        ? {
            ...o,
            vendorId: values.vendorId,
            expectedDeliveryDate: values.expectedDeliveryDate,
            items: values.items.map((i, idx) => ({ ...i, itemId: i.itemId || `i-${stamp(now, idx)}` })),
          }
        : o,
    ),
  }
}

export function saveVendor(data: AppData, values: VendorFormValues, vendorId?: string): AppData {
  if (vendorId) {
    return { ...data, vendors: data.vendors.map((v) => (v.vendorId === vendorId ? { ...v, ...values } : v)) }
  }
  const max = data.vendors.reduce((m, v) => Math.max(m, Number(v.vendorId.replace(/\D/g, '')) || 0), 0)
  const vendor: Vendor = { vendorId: `v${max + 1}`, ...values, status: 'Active' }
  return { ...data, vendors: [...data.vendors, vendor] }
}

export const toggleVendorStatus = (data: AppData, vendorId: string): AppData => ({
  ...data,
  vendors: data.vendors.map((v) =>
    v.vendorId === vendorId ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' } : v,
  ),
})
