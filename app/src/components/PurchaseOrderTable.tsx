import { ArrowDown, ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, formatMoney, isDelayed, orderTotal } from '../lib/derived'
import type { PurchaseOrder, Vendor } from '../types'
import { OrderStatusBadge } from './OrderStatusBadge'

export type SortKey = 'orderId' | 'vendor' | 'total' | 'expectedDeliveryDate' | 'status'
export interface SortState {
  key: SortKey
  dir: 'asc' | 'desc'
}

export interface PurchaseOrderTableProps {
  orders: PurchaseOrder[]
  vendors: Vendor[]
  sort: SortState
  onSortChange: (key: SortKey) => void
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'orderId', label: 'Order' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'total', label: 'Value' },
  { key: 'expectedDeliveryDate', label: 'Expected delivery' },
  { key: 'status', label: 'Status' },
]

export function PurchaseOrderTable({ orders, vendors, sort, onSortChange }: PurchaseOrderTableProps) {
  const vendorName = (id: string) => vendors.find((v) => v.vendorId === id)?.name ?? 'Unknown vendor'

  return (
    <>
      {/* Phone: card layout */}
      <ul className="space-y-3 md:hidden">
        {orders.map((o) => (
          <li key={o.orderId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <Link to={`/orders/${o.orderId}`} className="font-semibold text-brand-700 hover:underline">
                {o.orderId}
              </Link>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{vendorName(o.vendorId)}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium">{formatMoney(orderTotal(o))}</span>
              <span className={isDelayed(o) ? 'font-medium text-red-700' : 'text-slate-600'}>
                {formatDate(o.expectedDeliveryDate)}
                {isDelayed(o) && ' (overdue)'}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map((c) => {
                const active = sort.key === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="px-4 py-3 text-left font-semibold text-slate-700"
                  >
                    <button type="button" onClick={() => onSortChange(c.key)} className="inline-flex items-center gap-1 hover:text-brand-700">
                      {c.label}
                      {active && (sort.dir === 'asc' ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />)}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.orderId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">
                  <Link to={`/orders/${o.orderId}`} className="text-brand-700 hover:underline">
                    {o.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3">{vendorName(o.vendorId)}</td>
                <td className="px-4 py-3 tabular-nums">{formatMoney(orderTotal(o))}</td>
                <td className={`px-4 py-3 ${isDelayed(o) ? 'font-medium text-red-700' : ''}`}>
                  {formatDate(o.expectedDeliveryDate)}
                  {isDelayed(o) && <span className="ml-1 text-xs">(overdue)</span>}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
