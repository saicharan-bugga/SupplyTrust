import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react'
import { WIDGETS, isDefaultLayout, type DashboardLayout, type WidgetId } from '../lib/dashboardLayout'

interface Props {
  layout: DashboardLayout
  onMove: (id: WidgetId, dir: -1 | 1) => void
  onToggle: (id: WidgetId) => void
  onReset: () => void
  onClose: () => void
}

/** Panel to show/hide and reorder dashboard widgets. Uses buttons and checkboxes so it works by keyboard. */
export function DashboardCustomizer({ layout, onMove, onToggle, onReset, onClose }: Props) {
  const label = (id: WidgetId) => WIDGETS.find((w) => w.id === id)?.label ?? id
  return (
    <section className="st-card p-5" aria-labelledby="customize-h">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="customize-h" className="text-sm font-semibold text-slate-900">
            Customise dashboard
          </h2>
          <p className="text-xs text-slate-600">Choose what to show and the order. Saved for your profile on this device.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={isDefaultLayout(layout)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={14} aria-hidden /> Reset
          </button>
          <button type="button" onClick={onClose} className="st-btn-gold rounded-lg px-4 py-1.5 text-sm">
            Done
          </button>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {layout.order.map((id, i) => {
          const shown = !layout.hidden.includes(id)
          return (
            <li key={id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <label className="flex flex-1 items-center gap-2.5 text-sm text-slate-800">
                <input type="checkbox" checked={shown} onChange={() => onToggle(id)} className="h-4 w-4 accent-teal-700" />
                {label(id)}
              </label>
              <button
                type="button"
                onClick={() => onMove(id, -1)}
                disabled={i === 0}
                aria-label={`Move ${label(id)} up`}
                className="rounded-md p-1.5 text-slate-700 hover:bg-white disabled:opacity-30"
              >
                <ArrowUp size={16} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onMove(id, 1)}
                disabled={i === layout.order.length - 1}
                aria-label={`Move ${label(id)} down`}
                className="rounded-md p-1.5 text-slate-700 hover:bg-white disabled:opacity-30"
              >
                <ArrowDown size={16} aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
