import type { ReactNode } from 'react'

export interface DashboardCardProps {
  title: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger' | 'success'
  delay?: number
}

const ICON = {
  default: 'from-teal-400 to-teal-700 shadow-teal-600/40',
  warning: 'from-amber-300 to-amber-600 shadow-amber-500/40',
  danger: 'from-rose-400 to-rose-600 shadow-rose-500/40',
  success: 'from-emerald-400 to-emerald-700 shadow-emerald-600/40',
}

const GLOW = {
  default: 'rgba(20,184,166,0.14)',
  warning: 'rgba(245,158,11,0.16)',
  danger: 'rgba(244,63,94,0.13)',
  success: 'rgba(16,185,129,0.14)',
}

export function DashboardCard({ title, value, hint, icon, tone = 'default', delay = 0 }: DashboardCardProps) {
  return (
    <section
      className="st-card st-card-hover st-rise relative overflow-hidden p-5"
      style={{ ['--d' as string]: `${delay}s`, backgroundImage: `radial-gradient(12rem 8rem at 100% 0%, ${GLOW[tone]}, transparent 70%)` }}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-slate-600">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
        </div>
        {icon && (
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${ICON[tone]}`}>{icon}</span>
        )}
      </div>
      {hint && <p className="mt-3 text-xs font-medium text-slate-600">{hint}</p>}
    </section>
  )
}
