import type { AppData, OrderStatus, PurchaseOrder } from '../types'
import { orderTotal } from './derived'

export const STATUS_COLORS: Record<OrderStatus, string> = {
  Draft: '#94a3b8',
  'Pending Approval': '#f59e0b',
  Approved: '#10b981',
  Ordered: '#0ea5e9',
  'Partially Received': '#5f82b5',
  Received: '#16a34a',
  Cancelled: '#f43f5e',
}

export const greeting = (d = new Date()): string => {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export const initials = (name: string): string =>
  name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

export const statusBreakdown = (orders: PurchaseOrder[]) => {
  const counts = new Map<OrderStatus, number>()
  orders.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1))
  return [...counts.entries()].map(([status, count]) => ({ status, count, color: STATUS_COLORS[status] }))
}

export const vendorSpend = (data: AppData, orders: PurchaseOrder[]) => {
  const totals = new Map<string, { value: number; orders: number }>()
  orders
    .filter((o) => o.status !== 'Cancelled')
    .forEach((o) => {
      const cur = totals.get(o.vendorId) ?? { value: 0, orders: 0 }
      totals.set(o.vendorId, { value: cur.value + orderTotal(o), orders: cur.orders + 1 })
    })
  return [...totals.entries()]
    .map(([vendorId, t]) => ({
      vendorId,
      name: data.vendors.find((v) => v.vendorId === vendorId)?.name ?? 'Unknown vendor',
      ...t,
    }))
    .sort((a, b) => b.value - a.value)
}

const OPEN = ['Approved', 'Ordered', 'Partially Received']

export const upcomingDeliveries = (orders: PurchaseOrder[], today = new Date(), days = 21) => {
  const start = new Date(today.toDateString()).getTime()
  const end = start + days * 86_400_000
  return orders
    .filter((o) => OPEN.includes(o.status))
    .filter((o) => {
      const t = new Date(o.expectedDeliveryDate).getTime()
      return t >= start && t <= end
    })
    .sort((a, b) => a.expectedDeliveryDate.localeCompare(b.expectedDeliveryDate))
}

export const daysUntil = (iso: string, today = new Date()): number =>
  Math.round((new Date(iso).getTime() - new Date(today.toDateString()).getTime()) / 86_400_000)

export const recentActivity = (data: AppData, orders: PurchaseOrder[], limit = 6) => {
  const ids = new Set(orders.map((o) => o.orderId))
  return data.history
    .filter((h) => ids.has(h.orderId))
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))
    .slice(0, limit)
    .map((h) => ({
      ...h,
      who: data.users.find((u) => u.userId === h.changedBy)?.name ?? 'System',
    }))
}

export const toCsv = (rows: (string | number)[][]): string =>
  rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
