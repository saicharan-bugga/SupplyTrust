import { Hammer } from 'lucide-react'

export function PlaceholderPage({ title, week }: { title: string; week: number }) {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <div className="st-card st-rise flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 shadow-lg shadow-amber-400/30">
          <Hammer size={24} aria-hidden />
        </span>
        <p className="font-semibold text-slate-800">Coming soon</p>
        <p className="text-sm text-slate-600">This screen is planned for week {week}.</p>
      </div>
    </div>
  )
}
