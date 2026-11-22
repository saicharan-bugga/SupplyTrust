import { CalendarClock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { delayDays, formatDate, formatMoney, isDelayed, orderedQuantity, orderTotal, receivedQuantity } from '../lib/derived'
import { canReceive } from '../lib/workflow'
import type { AppData, PurchaseOrder } from '../types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { Progress, btnPrimary, inputCls } from './ui'

export interface VendorOrderPanelProps {
  data: AppData
  order: PurchaseOrder
  onUpdateEta: (date: string) => void
}

/** One order as the vendor sees it: what to deliver, how much is received, quality feedback and a delivery-date update. */
export function VendorOrderPanel({ data, order, onUpdateEta }: VendorOrderPanelProps) {
  const [date, setDate] = useState('')
  const got = receivedQuantity(data, order.orderId)
  const total = orderedQuantity(order)
  const inspections = data.inspections.filter((i) => i.orderId === order.orderId && (i.outcome === 'Passed' || i.outcome === 'Failed'))
  const rejected = inspections.reduce((s, i) => s + i.rejectedQuantity, 0)
  const open = canReceive(order)

  return (
    <article className="st-card p-5" aria-label={`Order ${order.orderId}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link to={`/orders/${order.orderId}`} className="text-lg font-semibold text-teal-800 hover:underline">
            {order.orderId}
          </Link>
          <p className="text-sm text-slate-600">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {formatMoney(orderTotal(order))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDelayed(order) && <OrderStatusBadge status="Delayed" />}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {order.items.map((i) => (
          <li key={i.itemId} className="flex justify-between gap-3">
            <span>{i.productName}</span>
            <span className="tabular-nums text-slate-600">× {i.orderedQuantity}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-600">
          <span>
            {got} of {total} units delivered
          </span>
          <span className={isDelayed(order) ? 'font-semibold text-rose-700' : ''}>
            Due {formatDate(order.expectedDeliveryDate)}
            {isDelayed(order) && ` (${delayDays(order)} days late)`}
          </span>
        </div>
        <Progress value={got} max={total} label={`${order.orderId} delivery progress`} />
      </div>

      {inspections.length > 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          Quality feedback: {inspections.length} {inspections.length === 1 ? 'inspection' : 'inspections'}, {rejected} units rejected.
        </p>
      )}

      {open ? (
        <form
          aria-label={`Update delivery date for ${order.orderId}`}
          className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!date) return
            onUpdateEta(date)
            setDate('')
          }}
        >
          <div>
            <label htmlFor={`eta-${order.orderId}`} className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <CalendarClock size={15} aria-hidden /> New delivery date
            </label>
            <input id={`eta-${order.orderId}`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls()} />
          </div>
          <button type="submit" disabled={!date} className={btnPrimary}>
            Update date
          </button>
        </form>
      ) : (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {order.status === 'Approved' ? 'Approved. Waiting for the buyer to send the order.' : 'Delivery dates can only change while an order is Ordered or Partially Received.'}
        </p>
      )}
    </article>
  )
}
