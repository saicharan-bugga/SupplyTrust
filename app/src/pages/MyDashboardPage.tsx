import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DashboardCard } from '../components/DashboardCard'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { PageHeader } from '../components/ui'
import { TaskPanel } from '../components/TaskPanel'
import { delayDays, formatDate, isDelayed, orderTotal, formatMoney } from '../lib/derived'
import { initials } from '../lib/insights'
import { ROLE_LABELS } from '../types'
import { useApp } from '../state/AppContext'

/** Personal workspace: who I am, what needs my attention, my numbers and my recent work. */
export function MyDashboardPage() {
  const { data, currentUser, visibleOrders } = useApp()
  const firstName = currentUser.name.split(' ')[0]

  const mine = useMemo(() => {
    const history = data.history.filter((h) => h.changedBy === currentUser.userId)
    const audit = data.audit.filter((a) => a.actorId === currentUser.userId)
    const recent = [
      ...history.map((h) => ({
        id: h.historyId,
        at: h.changedAt,
        text: h.previousStatus ? `${h.orderId}: ${h.previousStatus} to ${h.newStatus}` : `${h.orderId} created as ${h.newStatus}`,
      })),
      ...audit.map((a) => ({ id: a.auditId, at: a.at, text: `${a.action}${a.orderId ? ` · ${a.orderId}` : ''}` })),
    ].sort((a, b) => b.at.localeCompare(a.at))
    return {
      total: recent.length,
      recent: recent.slice(0, 5),
      created: history.filter((h) => h.previousStatus === null).length,
      decisions: data.approvals.filter((a) => a.approverId === currentUser.userId).length,
    }
  }, [data, currentUser.userId])

  const attention = visibleOrders
    .filter((o) => isDelayed(o) || o.status === 'Pending Approval')
    .sort((a, b) => a.expectedDeliveryDate.localeCompare(b.expectedDeliveryDate))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader title="My dashboard" subtitle="Your personal workspace: what needs you, and what you have done" />

      <section className="st-hero p-6 sm:p-8" aria-label="Welcome">
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-xl font-bold text-slate-900" aria-hidden>
            {initials(currentUser.name)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{ROLE_LABELS[currentUser.role]}</p>
            <p className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              Welcome back, {firstName}
            </p>
          </div>
        </div>
      </section>

      <TaskPanel />

      <section aria-label="My numbers" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Orders I can see" value={visibleOrders.length} hint="Based on my role" />
        <DashboardCard title="Orders I created" value={mine.created} hint="Started by me" tone="success" />
        <DashboardCard title="Decisions I made" value={mine.decisions} hint="Quality approvals" tone="warning" />
        <DashboardCard title="Actions recorded" value={mine.total} hint="Also in the audit log" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="st-card p-5" aria-labelledby="md-att">
          <h2 id="md-att" className="mb-3">Orders needing attention</h2>
          {attention.length === 0 ? (
            <p className="text-sm text-slate-600">Nothing is delayed or waiting for approval. Well done.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {attention.map((o) => (
                <li key={o.orderId} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/orders/${o.orderId}`} className="font-medium text-teal-800 hover:underline">{o.orderId}</Link>
                  <span className="text-xs text-slate-600">
                    {isDelayed(o) ? `${delayDays(o)} days late` : `Due ${formatDate(o.expectedDeliveryDate)}`} · {formatMoney(orderTotal(o))}
                  </span>
                  <OrderStatusBadge status={isDelayed(o) ? 'Delayed' : o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="st-card p-5" aria-labelledby="md-rec">
          <h2 id="md-rec" className="mb-3">My recent activity</h2>
          {mine.recent.length === 0 ? (
            <p className="text-sm text-slate-600">No activity yet. Actions you take appear here and in the audit log.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {mine.recent.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-800">{a.text}</span>
                  <span className="shrink-0 text-xs text-slate-600">{formatDate(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/profile" className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline">View my profile</Link>
        </section>
      </div>
    </div>
  )
}
