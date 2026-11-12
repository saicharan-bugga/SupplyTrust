import { ArrowLeft, Pencil, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderTimeline } from '../components/OrderTimeline'
import { delayDays, formatDate, formatMoney, isDelayed, orderTotal, outstandingQuantity, receivedQuantity } from '../lib/derived'
import { can } from '../lib/permissions'
import { ALLOWED_TRANSITIONS, applyTransition, canRoleTransition, isEditable } from '../lib/transitions'
import { useApp } from '../state/AppContext'
import type { OrderStatus } from '../types'

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  'Pending Approval': 'Submit for approval',
  Draft: 'Return to draft',
  Approved: 'Approve order',
  Ordered: 'Send to vendor',
  Cancelled: 'Cancel order',
}

// Receipt-driven statuses are set by the goods receipt screen (week 3), not by a button here.
const MANUAL: OrderStatus[] = ['Pending Approval', 'Draft', 'Approved', 'Ordered', 'Cancelled']

export function OrderDetailPage() {
  const { orderId } = useParams()
  const { data, setData, visibleOrders, currentUser, notify } = useApp()
  const [confirm, setConfirm] = useState<OrderStatus | null>(null)

  const order = visibleOrders.find((o) => o.orderId === orderId)
  if (!order) {
    return (
      <div className="st-card flex flex-col items-center gap-3 p-10 text-center" role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <ShieldAlert size={22} aria-hidden />
        </span>
        <p className="text-slate-700">This purchase order was not found, or your role cannot view it.</p>
        <Link to="/orders" className="text-sm font-medium text-teal-800 hover:underline">
          Back to purchase orders
        </Link>
      </div>
    )
  }

  const vendor = data.vendors.find((v) => v.vendorId === order.vendorId)
  const history = data.history.filter((h) => h.orderId === order.orderId)
  const inspections = data.inspections.filter((i) => i.orderId === order.orderId)
  const actions = ALLOWED_TRANSITIONS[order.status].filter((s) => MANUAL.includes(s) && canRoleTransition(currentUser.role, s))
  const received = receivedQuantity(data, order.orderId)
  const outstanding = outstandingQuantity(data, order)

  const run = (to: OrderStatus) => {
    try {
      setData((d) => applyTransition(d, order.orderId, to, currentUser.userId))
      notify(`${order.orderId} is now ${to}.`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Status change failed.', 'error')
    }
    setConfirm(null)
  }

  return (
    <div className="space-y-5">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline">
        <ArrowLeft size={16} aria-hidden /> Purchase orders
      </Link>

      <div className="st-rise flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{order.orderId}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {vendor?.name ?? 'Unknown vendor'} <OrderStatusBadge status={order.status} />
            {isDelayed(order) && <OrderStatusBadge status="Delayed" />}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can(currentUser.role, 'order.edit') && isEditable(order) && (
            <Link to={`/orders/${order.orderId}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              <Pencil size={16} aria-hidden /> Edit
            </Link>
          )}
          {actions.map((s) => {
            const destructive = s === 'Cancelled'
            return (
              <button
                key={s}
                type="button"
                onClick={() => (destructive || s === 'Draft' ? setConfirm(s) : run(s))}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm ${
                  destructive ? 'bg-white text-rose-700 ring-1 ring-rose-300 hover:bg-rose-50' : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                {ACTION_LABELS[s]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Order value" value={formatMoney(orderTotal(order))} />
        <Summary label="Expected delivery" value={formatDate(order.expectedDeliveryDate)} note={isDelayed(order) ? `${delayDays(order)} days overdue` : undefined} />
        <Summary label="Received" value={String(received)} />
        <Summary label="Outstanding" value={String(outstanding)} />
      </div>

      <section className="st-card st-scroll overflow-x-auto" aria-labelledby="items-h">
        <h2 id="items-h" className="px-5 pt-4 text-lg font-semibold">
          Items
        </h2>
        <table className="mt-2 min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-semibold">Product</th>
              <th scope="col" className="px-5 py-2.5 font-semibold">SKU</th>
              <th scope="col" className="px-5 py-2.5 text-right font-semibold">Qty</th>
              <th scope="col" className="px-5 py-2.5 text-right font-semibold">Unit price</th>
              <th scope="col" className="px-5 py-2.5 text-right font-semibold">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <tr key={i.itemId}>
                <td className="px-5 py-2.5">{i.productName}</td>
                <td className="px-5 py-2.5 text-slate-600">{i.sku}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{i.orderedQuantity}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{formatMoney(i.unitPrice)}</td>
                <td className="px-5 py-2.5 text-right font-medium tabular-nums">{formatMoney(i.orderedQuantity * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="st-card p-5" aria-labelledby="hist-h">
          <h2 id="hist-h" className="mb-4 text-lg font-semibold">
            Status history
          </h2>
          <OrderTimeline history={history} users={data.users} />
        </section>
        <section className="st-card p-5" aria-labelledby="insp-h">
          <h2 id="insp-h" className="mb-4 text-lg font-semibold">
            Inspection summary
          </h2>
          {inspections.length === 0 ? (
            <p className="text-sm text-slate-600">No inspections recorded for this order yet.</p>
          ) : (
            <ul className="space-y-3">
              {inspections.map((i) => (
                <li key={i.inspectionId} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <OrderStatusBadge status={i.outcome} />
                    <span className="text-xs text-slate-500">{formatDate(i.inspectedAt)}</span>
                  </div>
                  <p className="mt-2 text-slate-600">
                    Inspected {i.inspectedQuantity} · accepted {i.acceptedQuantity} · rejected {i.rejectedQuantity}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        destructive={confirm === 'Cancelled'}
        title={confirm === 'Cancelled' ? `Cancel ${order.orderId}?` : `Return ${order.orderId} to draft?`}
        message={
          confirm === 'Cancelled'
            ? 'A cancelled order accepts no further updates. This cannot be undone.'
            : 'The order goes back to Draft so it can be edited and resubmitted.'
        }
        confirmLabel={confirm === 'Cancelled' ? 'Cancel order' : 'Return to draft'}
        cancelLabel="Keep as is"
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && run(confirm)}
      />
    </div>
  )
}

function Summary({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="st-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs font-medium text-rose-700">{note}</p>}
    </div>
  )
}
