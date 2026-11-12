import { Check, X } from 'lucide-react'
import type { OrderStatus } from '../types'

const STEPS: OrderStatus[] = ['Draft', 'Pending Approval', 'Approved', 'Ordered', 'Partially Received', 'Received']

/** Horizontal progress tracker: completed steps are filled, the current step pulses, cancelled shows a stop marker. */
export function OrderPipeline({ status }: { status: OrderStatus }) {
  const cancelled = status === 'Cancelled'
  const idx = cancelled ? -1 : STEPS.indexOf(status)
  return (
    <nav aria-label="Order progress" className="st-card st-scroll overflow-x-auto p-5">
      <ol className="flex min-w-[34rem] items-start">
        {STEPS.map((s, n) => {
          const done = idx > n || status === 'Received'
          const current = idx === n && status !== 'Received'
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
              {n > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${done || current ? 'bg-teal-600' : 'bg-slate-200'}`} aria-hidden />}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  done ? 'bg-teal-600 text-white' : current ? 'st-pulse bg-amber-400 text-amber-950 ring-4 ring-amber-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {done ? <Check size={16} aria-hidden /> : n + 1}
              </span>
              <span className={`mt-2 text-xs font-medium ${done || current ? 'text-slate-900' : 'text-slate-600'}`}>{s}</span>
            </li>
          )
        })}
      </ol>
      {cancelled && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">
          <X size={16} aria-hidden /> This order was cancelled and accepts no further updates.
        </p>
      )}
    </nav>
  )
}
