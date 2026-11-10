import type { ReactNode } from 'react'

export interface DashboardCardProps {
  title: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger' | 'success'
}

const TONES = {
  default: 'bg-brand-100 text-brand-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  success: 'bg-emerald-100 text-emerald-700',
}

const ACCENT = {
  default: 'border-t-brand-500',
  warning: 'border-t-amber-500',
  danger: 'border-t-rose-500',
  success: 'border-t-emerald-500',
}

export function DashboardCard({ title, value, hint, icon, tone = 'default' }: DashboardCardProps) {
  return (
    <section
      className={`rounded-xl border border-t-4 border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${ACCENT[tone]}`}
      aria-label={title}
    >
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
