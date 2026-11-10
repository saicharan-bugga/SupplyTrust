import { AlertTriangle, ClipboardList, Hourglass, IndianRupee, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardCard } from '../components/DashboardCard'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { dashboardStats, delayDays, formatDate, formatMoney, isDelayed } from '../lib/derived'
import { useApp } from '../state/AppContext'
import { ROLE_LABELS } from '../types'

export function DashboardPage() {
  const { data, visibleOrders, currentUser } = useApp()
  const stats = dashboardStats(data, visibleOrders)
  const delayed = visibleOrders.filter((o) => isDelayed(o))
  const pending = visibleOrders.filter((o) => o.status === 'Pending Approval')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Signed in as {currentUser.name} ({ROLE_LABELS[currentUser.role]})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total orders" value={stats.totalOrders} icon={<ClipboardList size={20} aria-hidden />} hint={`${formatMoney(stats.totalValue)} active value`} />
        <DashboardCard title="Pending approvals" value={stats.pendingApprovals} tone="warning" icon={<Hourglass size={20} aria-hidden />} />
        <DashboardCard title="Delayed orders" value={stats.delayedOrders} tone="danger" icon={<AlertTriangle size={20} aria-hidden />} />
        <DashboardCard title="Inspection failures" value={stats.inspectionFailures} tone="danger" icon={<ShieldX size={20} aria-hidden />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="delayed-h">
          <h2 id="delayed-h" className="mb-3 flex items-center gap-2 font-semibold">
            <IndianRupee size={16} aria-hidden /> Delayed orders
          </h2>
          {delayed.length === 0 ? (
            <p className="text-sm text-slate-600">No delayed orders right now.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {delayed.map((o) => (
                <li key={o.orderId} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/orders/${o.orderId}`} className="whitespace-nowrap font-medium text-brand-700 hover:underline">
                    {o.orderId}
                  </Link>
                  <span className="text-red-700">
                    {delayDays(o)} days overdue (due {formatDate(o.expectedDeliveryDate)})
                  </span>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="pending-h">
          <h2 id="pending-h" className="mb-3 font-semibold">
            Awaiting approval
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-600">Nothing is waiting for approval.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((o) => (
                <li key={o.orderId} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link to={`/orders/${o.orderId}`} className="font-medium text-brand-700 hover:underline">
                    {o.orderId}
                  </Link>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
