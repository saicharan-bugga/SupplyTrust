import { PackageCheck, PackageOpen } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoodsReceiptForm } from '../components/GoodsReceiptForm'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { EmptyState, PageHeader, Progress } from '../components/ui'
import { formatDate, isDelayed, orderedQuantity, receivedQuantity } from '../lib/derived'
import { can } from '../lib/permissions'
import { canReceive, recordReceipt } from '../lib/workflow'
import { useApp } from '../state/AppContext'

export function ReceiptsPage() {
  const { data, setData, currentUser, notify } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const canRecord = can(currentUser.role, 'receipt.record')
  const vendorName = (id: string) => data.vendors.find((v) => v.vendorId === id)?.name ?? 'Unknown vendor'
  const receivable = data.orders.filter(canReceive)
  const receipts = [...data.receipts].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))

  return (
    <div className="space-y-6">
      <PageHeader title="Goods receipt" subtitle={`${receivable.length} orders awaiting delivery${canRecord ? '' : ' · view only for your role'}`} />

      {receivable.length === 0 ? (
        <EmptyState text="No orders are waiting for goods. Orders appear here once they are sent to the vendor." icon={<PackageCheck size={22} aria-hidden />} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {receivable.map((o, n) => {
            const got = receivedQuantity(data, o.orderId)
            const total = orderedQuantity(o)
            return (
              <li key={o.orderId} className="st-card st-rise p-5" style={{ ['--d' as string]: `${n * 0.05}s` }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link to={`/orders/${o.orderId}`} className="text-lg font-semibold text-teal-800 hover:underline">
                      {o.orderId}
                    </Link>
                    <p className="text-sm text-slate-600">{vendorName(o.vendorId)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDelayed(o) && <OrderStatusBadge status="Delayed" />}
                    <OrderStatusBadge status={o.status} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>
                      {got} of {total} units received
                    </span>
                    <span>Due {formatDate(o.expectedDeliveryDate)}</span>
                  </div>
                  <Progress value={got} max={total} label={`${o.orderId} received progress`} />
                </div>
                {open === o.orderId ? (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <GoodsReceiptForm
                      data={data}
                      order={o}
                      onCancel={() => setOpen(null)}
                      onSubmit={(qty, notes) => {
                        try {
                          setData((d) => recordReceipt(d, o.orderId, qty, notes, currentUser.userId))
                          notify(`Receipt recorded for ${o.orderId}. A quality inspection is now pending.`)
                          setOpen(null)
                        } catch (e) {
                          notify(e instanceof Error ? e.message : 'Could not record the receipt.', 'error')
                        }
                      }}
                    />
                  </div>
                ) : (
                  canRecord && (
                    <button type="button" onClick={() => setOpen(o.orderId)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 hover:bg-teal-800">
                      <PackageOpen size={16} aria-hidden /> Record receipt
                    </button>
                  )
                )}
              </li>
            )
          })}
        </ul>
      )}

      <section className="st-card p-5" aria-labelledby="rc-h">
        <h2 id="rc-h" className="mb-3 text-lg font-semibold">
          Receipt history
        </h2>
        {receipts.length === 0 ? (
          <p className="text-sm text-slate-600">No receipts recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {receipts.map((r) => (
              <li key={r.receiptId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <Link to={`/orders/${r.orderId}`} className="font-semibold text-teal-800 hover:underline">
                    {r.orderId}
                  </Link>{' '}
                  <span className="text-slate-600">· {r.receivedItems.reduce((s, i) => s + i.receivedQuantity, 0)} units</span>
                  {r.notes && <p className="text-xs text-slate-600">{r.notes}</p>}
                </div>
                <span className="text-xs text-slate-600">{formatDate(r.receivedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
