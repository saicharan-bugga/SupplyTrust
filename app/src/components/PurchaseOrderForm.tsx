import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { formatMoney } from '../lib/derived'
import { orderSchema, type OrderFormValues } from '../lib/orderSchema'
import type { Vendor } from '../types'
import { VendorSelector } from './VendorSelector'

export interface PurchaseOrderFormProps {
  vendors: Vendor[]
  defaultValues?: OrderFormValues
  /** Show the second "Submit for approval" action. */
  allowSubmit?: boolean
  submitLabel?: string
  onSave: (values: OrderFormValues, submitForApproval: boolean) => void
  onCancel: () => void
}

const BLANK_ITEM = { itemId: '', productName: '', sku: '', orderedQuantity: 1, unitPrice: 0 }
const EMPTY: OrderFormValues = { vendorId: '', expectedDeliveryDate: '', items: [BLANK_ITEM] }

const input = (bad: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 ${
    bad ? 'border-rose-500' : 'border-slate-300'
  }`

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-rose-700">
      {message}
    </p>
  ) : null
}

export function PurchaseOrderForm({
  vendors,
  defaultValues,
  allowSubmit = true,
  submitLabel = 'Save as draft',
  onSave,
  onCancel,
}: PurchaseOrderFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({ resolver: zodResolver(orderSchema), defaultValues: defaultValues ?? EMPTY })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const total = (items ?? []).reduce((s, i) => s + (Number(i?.orderedQuantity) || 0) * (Number(i?.unitPrice) || 0), 0)

  const submit = (submitForApproval: boolean) => handleSubmit((v) => onSave(v, submitForApproval))

  return (
    <form onSubmit={submit(false)} noValidate className="space-y-6" aria-label="Purchase order form">
      <div className="st-card grid gap-4 p-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="vendorId"
          render={({ field }) => (
            <VendorSelector vendors={vendors} value={field.value} onChange={field.onChange} error={errors.vendorId?.message} />
          )}
        />
        <div>
          <label htmlFor="po-date" className="mb-1 block text-sm font-medium text-slate-700">
            Expected delivery date
          </label>
          <input
            id="po-date"
            type="date"
            aria-invalid={!!errors.expectedDeliveryDate}
            className={input(!!errors.expectedDeliveryDate)}
            {...register('expectedDeliveryDate')}
          />
          <FieldError message={errors.expectedDeliveryDate?.message} />
        </div>
      </div>

      <fieldset className="st-card p-5">
        <legend className="px-1 text-sm font-semibold text-slate-800">Order items</legend>
        <div className="mt-2 space-y-4">
          {fields.map((f, idx) => {
            const e = errors.items?.[idx]
            return (
              <div key={f.id} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-12" role="group" aria-label={`Item ${idx + 1}`}>
                <div className="sm:col-span-4">
                  <label htmlFor={`pn-${idx}`} className="mb-1 block text-xs font-medium text-slate-600">
                    Product name
                  </label>
                  <input id={`pn-${idx}`} className={input(!!e?.productName)} aria-invalid={!!e?.productName} {...register(`items.${idx}.productName`)} />
                  <FieldError message={e?.productName?.message} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`sku-${idx}`} className="mb-1 block text-xs font-medium text-slate-600">
                    SKU
                  </label>
                  <input id={`sku-${idx}`} className={input(!!e?.sku)} aria-invalid={!!e?.sku} {...register(`items.${idx}.sku`)} />
                  <FieldError message={e?.sku?.message} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`qty-${idx}`} className="mb-1 block text-xs font-medium text-slate-600">
                    Quantity
                  </label>
                  <input
                    id={`qty-${idx}`}
                    type="number"
                    step={1}
                    className={input(!!e?.orderedQuantity)}
                    aria-invalid={!!e?.orderedQuantity}
                    {...register(`items.${idx}.orderedQuantity`, { valueAsNumber: true })}
                  />
                  <FieldError message={e?.orderedQuantity?.message} />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor={`price-${idx}`} className="mb-1 block text-xs font-medium text-slate-600">
                    Unit price (INR)
                  </label>
                  <input
                    id={`price-${idx}`}
                    type="number"
                    step="0.01"
                    className={input(!!e?.unitPrice)}
                    aria-invalid={!!e?.unitPrice}
                    {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                  />
                  <FieldError message={e?.unitPrice?.message} />
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    aria-label={`Remove item ${idx + 1}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <FieldError message={errors.items?.message ?? errors.items?.root?.message} />
        <button
          type="button"
          onClick={() => append(BLANK_ITEM)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-teal-800 shadow-sm ring-1 ring-slate-200 hover:bg-teal-50"
        >
          <Plus size={16} aria-hidden /> Add item
        </button>
        <p className="mt-4 text-right text-sm text-slate-600">
          Order total: <strong className="text-lg text-slate-900">{formatMoney(total)}</strong>
        </p>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm ring-1 ring-teal-600 hover:bg-teal-50">
          {submitLabel}
        </button>
        {allowSubmit && (
          <button type="button" onClick={submit(true)} className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 hover:bg-teal-800">
            Submit for approval
          </button>
        )}
      </div>
    </form>
  )
}
