import { AlertTriangle, ArrowRight, CalendarClock, ClipboardList, Hourglass, Plus, ShieldCheck, ShieldX, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DashboardCard } from '../components/DashboardCard'
import { TaskPanel } from '../components/TaskPanel'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { dashboardStats, delayDays, formatDate, formatMoney, isDelayed, orderTotal, rejectionRate } from '../lib/derived'
import { daysUntil, greeting, initials, recentActivity, statusBreakdown, upcomingDeliveries, vendorSpend, STATUS_COLORS } from '../lib/insights'
import { can } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import { ROLE_LABELS } from '../types'

function Panel({ title, id, icon, action, delay = 0, children }: { title: string; id: string; icon?: ReactNode; action?: ReactNode; delay?: number; children: ReactNode }) {
  return (
    <section className="st-card st-rise p-5" aria-labelledby={id} style={{ ['--d' as string]: `${delay}s` }}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id={id} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {icon && <span className="text-teal-700">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{children}</p>
}

function Donut({ percent, color }: { percent: number; color: string }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 110 110" className="h-36 w-36 -rotate-90" role="img" aria-label={`${percent}% of inspected units accepted`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="11" />
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        className="st-donut-arc"
        style={{ ['--dash' as string]: (c * percent) / 100 }}
      />
    </svg>
  )
}

export function DashboardPage() {
  const { data, visibleOrders, currentUser } = useApp()
  const stats = dashboardStats(data, visibleOrders)
  const delayed = visibleOrders.filter((o) => isDelayed(o))
  const pending = visibleOrders.filter((o) => o.status === 'Pending Approval')
  const vendorName = (id: string) => data.vendors.find((v) => v.vendorId === id)?.name ?? 'Unknown vendor'

  const breakdown = statusBreakdown(visibleOrders)
  const spend = vendorSpend(data, visibleOrders)
  const maxSpend = Math.max(1, ...spend.map((s) => s.value))
  const upcoming = upcomingDeliveries(visibleOrders).slice(0, 5)
  const activity = recentActivity(data, visibleOrders)
  const ids = new Set(visibleOrders.map((o) => o.orderId))
  const inspections = data.inspections.filter((i) => ids.has(i.orderId))
  const inspected = inspections.reduce((s, i) => s + i.inspectedQuantity, 0)
  const accepted = inspections.reduce((s, i) => s + i.acceptedQuantity, 0)
  const passRate = inspected === 0 ? 0 : Math.round((1 - rejectionRate(inspections)) * 100)
  const onTime = visibleOrders.length === 0 ? 100 : Math.round(((visibleOrders.length - delayed.length) / visibleOrders.length) * 100)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const firstName = currentUser.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <section className="st-hero st-rise p-6 sm:p-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              <Sparkles size={14} aria-hidden /> {today}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-2 text-sm text-teal-50/80">
              Signed in as {currentUser.name} ({ROLE_LABELS[currentUser.role]})
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-teal-50/90">
              {delayed.length + pending.length === 0
                ? 'Everything is on track. No orders need your attention right now.'
                : `${delayed.length} delayed ${delayed.length === 1 ? 'order' : 'orders'} and ${pending.length} awaiting approval need your attention today.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={can(currentUser.role, 'order.create') ? '/orders/new' : '/orders'} className="st-btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
                {can(currentUser.role, 'order.create') ? <Plus size={16} aria-hidden /> : <ClipboardList size={16} aria-hidden />}
                {can(currentUser.role, 'order.create') ? 'New purchase order' : 'View purchase orders'}
              </Link>
              {can(currentUser.role, 'inspection.decide') && (
                <Link to="/approvals" className="st-btn-glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
                  Review approvals <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              ['Active value', formatMoney(stats.totalValue)],
              ['On-time rate', `${onTime}%`],
              ['Quality pass', inspected === 0 ? '—' : `${passRate}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-teal-100/70">{k}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <TaskPanel />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard delay={0.05} title="Total orders" value={stats.totalOrders} icon={<ClipboardList size={20} aria-hidden />} hint={`${formatMoney(stats.totalValue)} active value`} />
        <DashboardCard delay={0.1} title="Pending approvals" value={stats.pendingApprovals} tone="warning" icon={<Hourglass size={20} aria-hidden />} hint={stats.pendingApprovals ? 'Awaiting a decision' : 'Queue is clear'} />
        <DashboardCard delay={0.15} title="Delayed orders" value={stats.delayedOrders} tone="danger" icon={<AlertTriangle size={20} aria-hidden />} hint={stats.delayedOrders ? 'Past expected delivery' : 'Nothing overdue'} />
        <DashboardCard delay={0.2} title="Inspection failures" value={stats.inspectionFailures} tone="danger" icon={<ShieldX size={20} aria-hidden />} hint={stats.inspectionFailures ? 'Needs follow-up' : 'No failures'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Order pipeline" id="pipeline-h" delay={0.25}>
            {breakdown.length === 0 ? (
              <Empty>No orders to chart yet.</Empty>
            ) : (
              <>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Orders by status">
                  {breakdown.map((b, i) => (
                    <div
                      key={b.status}
                      className="st-grow h-full border-r-2 border-white last:border-r-0"
                      style={{ width: `${(b.count / visibleOrders.length) * 100}%`, background: b.color, ['--d' as string]: `${0.3 + i * 0.08}s` }}
                      title={`${b.status}: ${b.count}`}
                    />
                  ))}
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {breakdown.map((b) => (
                    <li key={b.status} className="flex items-center gap-2.5 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                      <span className="flex-1 text-slate-600">{b.status}</span>
                      <span className="font-semibold tabular-nums text-slate-900">{b.count}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Quality health" id="quality-h" icon={<ShieldCheck size={16} aria-hidden />} delay={0.3}>
          {inspected === 0 ? (
            <Empty>No inspections recorded yet.</Empty>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Donut percent={passRate} color={passRate >= 90 ? '#10b981' : passRate >= 75 ? '#f59e0b' : '#f43f5e'} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold tabular-nums">{passRate}%</span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">accepted</span>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">Inspected</dt>
                  <dd className="font-semibold tabular-nums">{inspected.toLocaleString('en-IN')} units</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Accepted</dt>
                  <dd className="font-semibold tabular-nums text-emerald-700">{accepted.toLocaleString('en-IN')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Rejected</dt>
                  <dd className="font-semibold tabular-nums text-rose-700">{inspections.reduce((s, i) => s + i.rejectedQuantity, 0).toLocaleString('en-IN')}</dd>
                </div>
              </dl>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Spend by vendor" id="spend-h" delay={0.35}>
          {spend.length === 0 ? (
            <Empty>No vendor spend yet.</Empty>
          ) : (
            <ul className="space-y-4">
              {spend.map((s, i) => (
                <li key={s.vendorId}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2.5 font-medium text-slate-800">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[0.65rem] font-bold text-teal-800">{initials(s.name)}</span>
                      {s.name}
                    </span>
                    <span className="tabular-nums text-slate-600">
                      {formatMoney(s.value)} <span className="text-xs text-slate-400">· {s.orders} PO</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="st-grow h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-700"
                      style={{ width: `${(s.value / maxSpend) * 100}%`, ['--d' as string]: `${0.4 + i * 0.1}s` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming deliveries" id="upcoming-h" icon={<CalendarClock size={16} aria-hidden />} delay={0.4}>
          {upcoming.length === 0 ? (
            <Empty>No deliveries expected in the next 3 weeks.</Empty>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((o) => {
                const d = daysUntil(o.expectedDeliveryDate)
                return (
                  <li key={o.orderId} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-teal-800 shadow-sm ring-1 ring-slate-200">
                      <span className="text-[0.6rem] font-semibold uppercase leading-none">
                        {new Date(o.expectedDeliveryDate).toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold leading-tight">{new Date(o.expectedDeliveryDate).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/orders/${o.orderId}`} className="text-sm font-semibold text-teal-800 hover:underline">
                        {o.orderId}
                      </Link>
                      <p className="truncate text-xs text-slate-500">{vendorName(o.vendorId)}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Delayed orders" id="delayed-h" icon={<AlertTriangle size={16} aria-hidden />} delay={0.45}>
          {delayed.length === 0 ? (
            <Empty>No delayed orders right now.</Empty>
          ) : (
            <ul className="space-y-2">
              {delayed.map((o) => (
                <li key={o.orderId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-l-4 border-rose-400 bg-rose-50/50 px-3 py-2.5 text-sm">
                  <div>
                    <Link to={`/orders/${o.orderId}`} className="whitespace-nowrap font-semibold text-teal-800 hover:underline">
                      {o.orderId}
                    </Link>
                    <p className="text-xs font-medium text-rose-700">
                      {delayDays(o)} days overdue (due {formatDate(o.expectedDeliveryDate)})
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Awaiting approval" id="pending-h" delay={0.5}>
          {pending.length === 0 ? (
            <Empty>Nothing is waiting for approval.</Empty>
          ) : (
            <ul className="space-y-2">
              {pending.map((o) => (
                <li key={o.orderId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-l-4 border-amber-400 bg-amber-50/50 px-3 py-2.5 text-sm">
                  <div>
                    <Link to={`/orders/${o.orderId}`} className="font-semibold text-teal-800 hover:underline">
                      {o.orderId}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {vendorName(o.vendorId)} · {formatMoney(orderTotal(o))}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent activity" id="activity-h" delay={0.55}>
        {activity.length === 0 ? (
          <Empty>No activity yet.</Empty>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-slate-100 pl-6">
            {activity.map((a) => (
              <li key={a.historyId} className="relative">
                <span className="absolute -left-[1.95rem] top-1 h-3 w-3 rounded-full ring-4 ring-white" style={{ background: STATUS_COLORS[a.newStatus] }} />
                <p className="text-sm text-slate-800">
                  <Link to={`/orders/${a.orderId}`} className="font-semibold text-teal-800 hover:underline">
                    {a.orderId}
                  </Link>{' '}
                  {a.previousStatus ? `moved from ${a.previousStatus} to` : 'was created as'} <strong>{a.newStatus}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  {a.who} · {formatDate(a.changedAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  )
}
