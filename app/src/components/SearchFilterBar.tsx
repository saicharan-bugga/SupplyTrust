import { Search } from 'lucide-react'
import type { OrderStatus } from '../types'

export const STATUS_OPTIONS: OrderStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Ordered',
  'Partially Received',
  'Received',
  'Cancelled',
]

export interface SearchFilterBarProps {
  query: string
  status: OrderStatus | 'All'
  onQueryChange: (q: string) => void
  onStatusChange: (s: OrderStatus | 'All') => void
}

export function SearchFilterBar({ query, status, onQueryChange, onStatusChange }: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search orders</span>
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by order reference or vendor"
          className="w-full rounded-xl border-0 bg-slate-900/5 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-teal-500/40"
        />
      </label>
      <label className="sm:w-56">
        <span className="sr-only">Filter by status</span>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus | 'All')}
          className="w-full rounded-xl border-0 bg-slate-900/5 px-3 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-teal-500/40"
        >
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
