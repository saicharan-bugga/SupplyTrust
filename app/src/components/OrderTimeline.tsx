import { formatDate } from '../lib/derived'
import type { StatusHistory, User } from '../types'
import { OrderStatusBadge } from './OrderStatusBadge'

export interface OrderTimelineProps {
  history: StatusHistory[]
  users: User[]
}

/** Chronological (oldest first) list of status transitions. */
export function OrderTimeline({ history, users }: OrderTimelineProps) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-600">No status changes recorded yet.</p>
  }
  const sorted = [...history].sort((a, b) => a.changedAt.localeCompare(b.changedAt))
  const who = (id: string) => users.find((u) => u.userId === id)?.name ?? 'Unknown'
  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-brand-100 pl-5">
      {sorted.map((h) => (
        <li key={h.historyId} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" aria-hidden />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {h.previousStatus && (
              <>
                <OrderStatusBadge status={h.previousStatus} />
                <span aria-label="changed to">{'->'}</span>
              </>
            )}
            <OrderStatusBadge status={h.newStatus} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(h.changedAt)} by {who(h.changedBy)}
          </p>
        </li>
      ))}
    </ol>
  )
}
