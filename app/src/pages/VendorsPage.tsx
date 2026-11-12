import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Power, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { formatMoney, orderTotal } from '../lib/derived'
import { initials } from '../lib/insights'
import { saveVendor, toggleVendorStatus } from '../lib/orders'
import { vendorSchema, type VendorFormValues } from '../lib/orderSchema'
import { can } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import type { Vendor } from '../types'

const input = (bad: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 ${
    bad ? 'border-rose-500' : 'border-slate-300'
  }`

function VendorForm({ vendor, onSave, onCancel }: { vendor?: Vendor; onSave: (v: VendorFormValues) => void; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor ? { name: vendor.name, email: vendor.email, contact: vendor.contact } : { name: '', email: '', contact: '' },
  })
  const fields: { key: keyof VendorFormValues; label: string; type: string }[] = [
    { key: 'name', label: 'Vendor name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'contact', label: 'Contact number', type: 'tel' },
  ]
  return (
    <form onSubmit={handleSubmit(onSave)} noValidate aria-label="Vendor form" className="st-card grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
      {fields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`v-${f.key}`} className="mb-1 block text-sm font-medium text-slate-700">
            {f.label}
          </label>
          <input id={`v-${f.key}`} type={f.type} aria-invalid={!!errors[f.key]} className={input(!!errors[f.key])} {...register(f.key)} />
          {errors[f.key] && (
            <p role="alert" className="mt-1 text-xs text-rose-700">
              {errors[f.key]?.message}
            </p>
          )}
        </div>
      ))}
      <div className="flex justify-end gap-3 sm:col-span-3">
        <button type="button" onClick={onCancel} className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
          {vendor ? 'Save vendor' : 'Add vendor'}
        </button>
      </div>
    </form>
  )
}

export function VendorsPage() {
  const { data, setData, currentUser, notify } = useApp()
  const [editing, setEditing] = useState<Vendor | 'new' | null>(null)
  const [toggling, setToggling] = useState<Vendor | null>(null)
  const manage = can(currentUser.role, 'vendor.manage')

  const stats = (id: string) => {
    const orders = data.orders.filter((o) => o.vendorId === id)
    return { count: orders.length, value: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + orderTotal(o), 0) }
  }

  return (
    <div className="space-y-5">
      <div className="st-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Vendors</h1>
          <p className="mt-1 text-sm text-slate-600">{data.vendors.length} vendors · inactive vendors cannot receive new orders</p>
        </div>
        {manage && editing === null && (
          <button type="button" onClick={() => setEditing('new')} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 hover:bg-teal-800">
            <Plus size={16} aria-hidden /> Add vendor
          </button>
        )}
      </div>

      {editing !== null && (
        <VendorForm
          key={editing === 'new' ? 'new' : editing.vendorId}
          vendor={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={(values) => {
            setData((d) => saveVendor(d, values, editing === 'new' ? undefined : editing.vendorId))
            notify(editing === 'new' ? `${values.name} added.` : `${values.name} updated.`)
            setEditing(null)
          }}
        />
      )}

      {data.vendors.length === 0 ? (
        <div className="st-card flex flex-col items-center gap-3 p-10 text-center text-slate-600">
          <Users size={22} aria-hidden />
          <p>No vendors yet. Add your first vendor to start creating orders.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.vendors.map((v) => {
            const s = stats(v.vendorId)
            return (
              <li key={v.vendorId} className="st-card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-800" aria-hidden>
                    {initials(v.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-slate-900">{v.name}</h2>
                    <p className="truncate text-sm text-slate-600">{v.email}</p>
                    <p className="text-sm text-slate-600">{v.contact}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${v.status === 'Active' ? 'bg-emerald-50 text-emerald-800 ring-emerald-300' : 'bg-slate-100 text-slate-600 ring-slate-300'}`}>
                    {v.status}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-600">Orders</dt>
                    <dd className="font-semibold tabular-nums">{s.count}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-600">Order value</dt>
                    <dd className="font-semibold tabular-nums">{formatMoney(s.value)}</dd>
                  </div>
                </dl>
                {manage && (
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setEditing(v)} aria-label={`Edit ${v.name}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                      <Pencil size={14} aria-hidden /> Edit
                    </button>
                    <button type="button" onClick={() => setToggling(v)} aria-label={`${v.status === 'Active' ? 'Deactivate' : 'Activate'} ${v.name}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                      <Power size={14} aria-hidden /> {v.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toggling !== null}
        destructive={toggling?.status === 'Active'}
        title={toggling?.status === 'Active' ? `Deactivate ${toggling.name}?` : `Activate ${toggling?.name}?`}
        message={
          toggling?.status === 'Active'
            ? 'This vendor will no longer appear when creating new purchase orders. Existing orders are unaffected.'
            : 'This vendor can receive new purchase orders again.'
        }
        confirmLabel={toggling?.status === 'Active' ? 'Deactivate' : 'Activate'}
        onCancel={() => setToggling(null)}
        onConfirm={() => {
          if (toggling) {
            setData((d) => toggleVendorStatus(d, toggling.vendorId))
            notify(`${toggling.name} is now ${toggling.status === 'Active' ? 'Inactive' : 'Active'}.`)
          }
          setToggling(null)
        }}
      />
    </div>
  )
}
