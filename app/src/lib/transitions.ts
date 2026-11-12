import type { AppData, OrderStatus, PurchaseOrder, Role } from '../types'

/** Allowed status transitions (workflow rule: invalid transitions are blocked). */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Draft: ['Pending Approval', 'Cancelled'],
  'Pending Approval': ['Approved', 'Draft', 'Cancelled'],
  Approved: ['Ordered', 'Cancelled'],
  Ordered: ['Partially Received', 'Received', 'Cancelled'],
  'Partially Received': ['Partially Received', 'Received', 'Cancelled'],
  Received: [],
  Cancelled: [],
}

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => ALLOWED_TRANSITIONS[from].includes(to)

/** Orders can be edited only before they are sent to the vendor. */
export const isEditable = (o: PurchaseOrder): boolean => o.status === 'Draft' || o.status === 'Pending Approval'

/** Roles allowed to move an order into a given status from the order screen. */
const TRANSITION_ROLES: Partial<Record<OrderStatus, Role[]>> = {
  'Pending Approval': ['procurement_officer'],
  Draft: ['procurement_officer'],
  Approved: ['procurement_manager', 'procurement_officer'],
  Ordered: ['procurement_officer'],
  Cancelled: ['procurement_officer'],
}

export const canRoleTransition = (role: Role, to: OrderStatus): boolean => (TRANSITION_ROLES[to] ?? []).includes(role)

export const nextOrderId = (orders: PurchaseOrder[], year = new Date().getFullYear()): string => {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.orderId.split('-').pop()) || 0), 0)
  return `PO-${year}-${String(max + 1).padStart(3, '0')}`
}

/** Pure helper: apply a status change and append a history record. Throws on an invalid transition. */
export function applyTransition(data: AppData, orderId: string, to: OrderStatus, userId: string, now = new Date()): AppData {
  const order = data.orders.find((o) => o.orderId === orderId)
  if (!order) throw new Error('Order not found')
  if (!canTransition(order.status, to)) throw new Error(`Cannot change status from ${order.status} to ${to}`)
  return {
    ...data,
    orders: data.orders.map((o) => (o.orderId === orderId ? { ...o, status: to } : o)),
    history: [
      ...data.history,
      {
        historyId: `h-${Date.now()}-${data.history.length}`,
        orderId,
        previousStatus: order.status,
        newStatus: to,
        changedBy: userId,
        changedAt: now.toISOString(),
      },
    ],
  }
}
