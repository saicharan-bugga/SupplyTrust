import type { AppData, PurchaseOrder, QualityInspection } from '../types'

export const orderTotal = (o: PurchaseOrder): number =>
  o.items.reduce((sum, i) => sum + i.orderedQuantity * i.unitPrice, 0)

export const orderedQuantity = (o: PurchaseOrder): number =>
  o.items.reduce((sum, i) => sum + i.orderedQuantity, 0)

export const receivedQuantity = (data: AppData, orderId: string): number =>
  data.receipts
    .filter((r) => r.orderId === orderId)
    .flatMap((r) => r.receivedItems)
    .reduce((sum, i) => sum + i.receivedQuantity, 0)

export const outstandingQuantity = (data: AppData, o: PurchaseOrder): number =>
  Math.max(0, orderedQuantity(o) - receivedQuantity(data, o.orderId))

const TERMINAL = ['Received', 'Cancelled', 'Draft']

export const isDelayed = (o: PurchaseOrder, today = new Date()): boolean =>
  !TERMINAL.includes(o.status) &&
  new Date(o.expectedDeliveryDate).getTime() < new Date(today.toDateString()).getTime()

export const delayDays = (o: PurchaseOrder, today = new Date()): number => {
  if (!isDelayed(o, today)) return 0
  const ms = new Date(today.toDateString()).getTime() - new Date(o.expectedDeliveryDate).getTime()
  return Math.round(ms / 86_400_000)
}

export const rejectionRate = (inspections: QualityInspection[]): number => {
  const inspected = inspections.reduce((s, i) => s + i.inspectedQuantity, 0)
  const rejected = inspections.reduce((s, i) => s + i.rejectedQuantity, 0)
  return inspected === 0 ? 0 : rejected / inspected
}

export const formatMoney = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export interface DashboardStats {
  totalOrders: number
  pendingApprovals: number
  delayedOrders: number
  inspectionFailures: number
  totalValue: number
}

export const dashboardStats = (data: AppData, orders = data.orders): DashboardStats => {
  const ids = new Set(orders.map((o) => o.orderId))
  return {
    totalOrders: orders.length,
    pendingApprovals: orders.filter((o) => o.status === 'Pending Approval').length,
    delayedOrders: orders.filter((o) => isDelayed(o)).length,
    inspectionFailures: data.inspections.filter((i) => ids.has(i.orderId) && i.outcome === 'Failed').length,
    totalValue: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + orderTotal(o), 0),
  }
}
