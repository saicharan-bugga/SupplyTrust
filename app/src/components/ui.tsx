import { Inbox, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const inputCls = (bad = false) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 ${bad ? 'border-rose-500' : 'border-slate-300'}`

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="st-rise flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ text, icon, children }: { text: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="st-card flex flex-col items-center gap-3 p-10 text-center text-slate-600">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">{icon ?? <Inbox size={22} aria-hidden />}</span>
      <p>{text}</p>
      {children}
    </div>
  )
}

export function Unauthorized({ text, to = '/', label = 'Back to dashboard' }: { text: string; to?: string; label?: string }) {
  return (
    <div className="st-card flex flex-col items-center gap-3 p-10 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
        <ShieldAlert size={22} aria-hidden />
      </span>
      <p className="text-slate-700">{text}</p>
      <Link to={to} className="text-sm font-medium text-teal-800 hover:underline">
        {label}
      </Link>
    </div>
  )
}

export function Progress({ value, max, tone = 'teal', label }: { value: number; max: number; tone?: 'teal' | 'amber' | 'rose'; label: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const color = { teal: 'bg-teal-600', amber: 'bg-amber-500', rose: 'bg-rose-500' }[tone]
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color} transition-[width] duration-700`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-rose-700">
      {message}
    </p>
  ) : null
}

export const btnPrimary = 'rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 transition hover:bg-teal-800 disabled:opacity-50'
export const btnGhost = 'rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50'
