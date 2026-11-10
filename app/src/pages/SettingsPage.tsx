import { useApp } from '../state/AppContext'

export function SettingsPage() {
  const { resetData, notify } = useApp()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Demo data</h2>
        <p className="mt-1 text-sm text-slate-600">Reset all vendors, orders and inspections back to the original sample data.</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          onClick={() => {
            resetData()
            notify('Sample data restored.')
          }}
        >
          Reset sample data
        </button>
      </section>
    </div>
  )
}
