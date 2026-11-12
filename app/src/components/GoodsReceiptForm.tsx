import { useState } from 'react'
import { outstandingByItem, validateReceipt } from '../lib/workflow'
import type { AppData, PurchaseOrder } from '../types'
import { btnGhost, btnPrimary, FieldError, inputCls } from './ui'

export interface GoodsReceiptFormProps {
  data: AppData
  order: PurchaseOrder
  onSubmit: (qty: Record<string, number>, notes: string) => void
  onCancel: () => void
}

/** Records how many units of each item arrived. Quantities are checked against what is still outstanding. */
export function GoodsReceiptForm({ data, order, onSubmit, onCancel }: GoodsReceiptFormProps) {
  const left = outstandingByItem(data, order)
  const [qty, setQty] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const parsed = () => Object.fromEntries(order.items.map((i) => [i.itemId, qty[i.itemId] === undefined || qty[i.itemId] === '' ? 0 : Number(qty[i.itemId])]))

  return (
    <form
      aria-label={`Goods receipt for ${order.orderId}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const q = parsed()
        const errs = validateReceipt(data, order, q)
        setErrors(errs)
        if (Object.keys(errs).length === 0) onSubmit(q, notes.trim())
      }}
      className="space-y-4"
    >
      <div className="space-y-3">
        {order.items.map((i) => (
          <div key={i.itemId} className="grid grid-cols-1 items-center gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_auto_9rem]">
            <div>
              <p className="text-sm font-medium text-slate-900">{i.productName}</p>
              <p className="text-xs text-slate-600">
                {i.sku} · ordered {i.orderedQuantity}
              </p>
            </div>
            <p className="text-sm text-slate-600">
              Outstanding <strong className="tabular-nums text-slate-900">{left[i.itemId]}</strong>
            </p>
            <div>
              <label htmlFor={`rq-${order.orderId}-${i.itemId}`} className="sr-only">
                Received quantity for {i.productName}
              </label>
              <input
                id={`rq-${order.orderId}-${i.itemId}`}
                type="number"
                min={0}
                step={1}
                placeholder="Received"
                disabled={left[i.itemId] === 0}
                value={qty[i.itemId] ?? ''}
                aria-invalid={!!errors[i.itemId]}
                onChange={(e) => setQty((s) => ({ ...s, [i.itemId]: e.target.value }))}
                className={inputCls(!!errors[i.itemId])}
              />
              <FieldError message={errors[i.itemId]} />
            </div>
          </div>
        ))}
      </div>
      <FieldError message={errors._form} />
      <div>
        <label htmlFor={`rn-${order.orderId}`} className="mb-1 block text-sm font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea id={`rn-${order.orderId}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls()} placeholder="Condition of packaging, short shipment reason…" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          Record receipt
        </button>
      </div>
    </form>
  )
}
