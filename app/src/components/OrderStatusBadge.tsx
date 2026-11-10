import { AlertTriangle, CheckCircle2, Clock, FileEdit, PackageCheck, PackageOpen, Truck, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { InspectionOutcome, OrderStatus } from '../types'

type Status = OrderStatus | InspectionOutcome | 'Delayed'

interface Style {
  classes: string
  icon: ReactNode
}

const STYLES: Record<Status, Style> = {
  Draft: { classes: 'bg-slate-100 text-slate-700 ring-slate-300', icon: <FileEdit size={14} aria-hidden /> },
  'Pending Approval': { classes: 'bg-amber-50 text-amber-800 ring-amber-300', icon: <Clock size={14} aria-hidden /> },
  Approved: { classes: 'bg-emerald-50 text-emerald-800 ring-emerald-300', icon: <CheckCircle2 size={14} aria-hidden /> },
  Ordered: { classes: 'bg-sky-50 text-sky-800 ring-sky-300', icon: <Truck size={14} aria-hidden /> },
  'Partially Received': { classes: 'bg-cyan-50 text-cyan-800 ring-cyan-300', icon: <PackageOpen size={14} aria-hidden /> },
  Received: { classes: 'bg-green-50 text-green-800 ring-green-300', icon: <PackageCheck size={14} aria-hidden /> },
  Cancelled: { classes: 'bg-rose-50 text-rose-800 ring-rose-300', icon: <XCircle size={14} aria-hidden /> },
  'Pending Inspection': { classes: 'bg-amber-50 text-amber-800 ring-amber-300', icon: <Clock size={14} aria-hidden /> },
  Passed: { classes: 'bg-emerald-50 text-emerald-800 ring-emerald-300', icon: <CheckCircle2 size={14} aria-hidden /> },
  Failed: { classes: 'bg-red-50 text-red-800 ring-red-300', icon: <XCircle size={14} aria-hidden /> },
  'Reinspection Required': { classes: 'bg-orange-50 text-orange-800 ring-orange-300', icon: <AlertTriangle size={14} aria-hidden /> },
  Delayed: { classes: 'bg-red-50 text-red-800 ring-red-300', icon: <AlertTriangle size={14} aria-hidden /> },
}

export interface OrderStatusBadgeProps {
  status: Status
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const s = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.classes}`}
    >
      {s.icon}
      {status}
    </span>
  )
}
