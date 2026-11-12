import { ArrowRight, CalendarClock, ClipboardCheck, PackageOpen, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isDelayed } from '../lib/derived'
import { awaitingDecision, canReceive } from '../lib/workflow'
import { useApp } from '../state/AppContext'

interface Task {
  to: string
  label: string
  count: number
  hint: string
  icon: ReactNode
}

/** "Your work today": tasks that depend on the signed-in role, each linking to the screen that clears it. */
export function TaskPanel() {
  const { data, currentUser, visibleOrders } = useApp()
  const role = currentUser.role
  const tasks: Task[] = []

  const toReceive = data.orders.filter(canReceive).length
  const toInspect = data.inspections.filter((i) => i.outcome === 'Pending Inspection').length
  const toDecide = data.inspections.filter((i) => awaitingDecision(data, i)).length
  const toApprove = data.orders.filter((o) => o.status === 'Pending Approval').length
  const delayed = visibleOrders.filter((o) => isDelayed(o)).length
  const vendorOpen = visibleOrders.filter(canReceive).length

  if (role === 'warehouse_receiver') tasks.push({ to: '/receipts', label: 'Orders waiting for goods', count: toReceive, hint: 'Record what arrived', icon: <PackageOpen size={20} aria-hidden /> })
  if (role === 'quality_inspector') tasks.push({ to: '/inspections', label: 'Inspections to complete', count: toInspect, hint: 'Record accepted and rejected units', icon: <ShieldCheck size={20} aria-hidden /> })
  if (role === 'procurement_officer' || role === 'procurement_manager') {
    tasks.push({ to: '/approvals', label: 'Inspections awaiting a decision', count: toDecide, hint: 'Approve, reject or request reinspection', icon: <ClipboardCheck size={20} aria-hidden /> })
    tasks.push({ to: '/orders?q=', label: 'Orders pending approval', count: toApprove, hint: 'Open an order to approve it', icon: <Sparkles size={20} aria-hidden /> })
  }
  if (role === 'vendor') tasks.push({ to: '/orders', label: 'Open orders to deliver', count: vendorOpen, hint: 'Keep expected delivery dates up to date', icon: <CalendarClock size={20} aria-hidden /> })
  if (delayed > 0) tasks.push({ to: '/orders', label: 'Delayed orders', count: delayed, hint: 'Past their expected delivery date', icon: <CalendarClock size={20} aria-hidden /> })

  if (tasks.length === 0) return null
  return (
    <section aria-label="Your tasks" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((t, n) => (
        <Link key={t.label} to={t.to} className="st-card st-card-hover st-rise group flex items-center gap-4 p-4" style={{ ['--d' as string]: `${0.1 + n * 0.06}s` }}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{t.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-2xl font-semibold tabular-nums text-slate-900">{t.count}</span>
            <span className="block truncate text-sm font-medium text-slate-700">{t.label}</span>
            <span className="block truncate text-xs text-slate-500">{t.hint}</span>
          </span>
          <ArrowRight size={18} aria-hidden className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-700" />
        </Link>
      ))}
    </section>
  )
}
