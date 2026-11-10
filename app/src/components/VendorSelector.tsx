import { useId } from 'react'
import type { Vendor } from '../types'

export interface VendorSelectorProps {
  vendors: Vendor[]
  value: string
  onChange: (vendorId: string) => void
  error?: string
  label?: string
}

/** Lists only Active vendors; inactive vendors cannot receive new orders. */
export function VendorSelector({ vendors, value, onChange, error, label = 'Vendor' }: VendorSelectorProps) {
  const id = useId()
  const eligible = vendors.filter((v) => v.status === 'Active')
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm ${error ? 'border-rose-500' : 'border-slate-300'}`}
      >
        <option value="">Select a vendor</option>
        {eligible.map((v) => (
          <option key={v.vendorId} value={v.vendorId}>
            {v.name}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}
