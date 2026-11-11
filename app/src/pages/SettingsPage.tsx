import { RotateCcw } from 'lucide-react'
import { useApp } from '../state/AppContext'

export function SettingsPage() {
  const { resetData, notify } = useApp()
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
      <section className="st-card st-rise flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-semibold text-slate-900">Demo data</h2>
          <p className="mt-1 max-w-lg text-sm text-slate-500">Reset all vendors, orders and inspections back to the original sample data.</p>
        </div>
        <button
          type="button"
          className="st-btn-gold inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          onClick={() => {
            resetData()
            notify('Sample data restored.')
          }}
        >
          <RotateCcw size={16} aria-hidden /> Reset sample data
        </button>
      </section>
    </div>
  )
}
