import type { ReactNode } from 'react'

export interface DashboardCardProps {
  title: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger' | 'success'
}

const TONES = {
  default: 'bg-brand-50 text-brand-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  success: 'bg-emerald-50 text-emerald-700',
}

export function DashboardCard({ title, value, hint, icon, tone = 'default' }: DashboardCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        {icon && <span className={`rounded-lg p-2 ${TONES[tone]}`}>{icon}</span>}
      </div>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </section>
  )
}
