import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { outcomeFor, validateInspection } from '../lib/workflow'
import type { QualityInspection } from '../types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { btnGhost, btnPrimary, FieldError, inputCls } from './ui'

export interface InspectionFormProps {
  inspection: QualityInspection
  onSubmit: (input: { acceptedQuantity: number; rejectedQuantity: number; notes: string; defects: { category: string; quantity: number; description: string }[] }) => void
  onCancel: () => void
}

export const DEFECT_CATEGORIES = ['Damage', 'Dimensional', 'Functional', 'Cosmetic', 'Contamination', 'Wrong item', 'Packaging']

interface DefectRow {
  category: string
  quantity: string
  description: string
}

export function InspectionForm({ inspection, onSubmit, onCancel }: InspectionFormProps) {
  const total = inspection.inspectedQuantity
  const [accepted, setAccepted] = useState(String(total))
  const [rejected, setRejected] = useState('0')
  const [notes, setNotes] = useState('')
  const [defects, setDefects] = useState<DefectRow[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const a = Number(accepted)
  const r = Number(rejected)
  const preview = Number.isFinite(a) && Number.isFinite(r) && a + r === total ? outcomeFor(total, r) : null
  const toInput = () => ({
    acceptedQuantity: a,
    rejectedQuantity: r,
    notes: notes.trim(),
    defects: defects.map((d) => ({ category: d.category, quantity: Number(d.quantity) || 0, description: d.description.trim() })),
  })

  // Keep the two quantities consistent as the inspector types: rejected = total - accepted.
  const changeRejected = (v: string) => {
    setRejected(v)
    const n = Number(v)
    if (v !== '' && Number.isInteger(n) && n >= 0 && n <= total) setAccepted(String(total - n))
  }
  const changeAccepted = (v: string) => {
    setAccepted(v)
    const n = Number(v)
    if (v !== '' && Number.isInteger(n) && n >= 0 && n <= total) setRejected(String(total - n))
  }

  return (
    <form
      aria-label={`Inspection ${inspection.inspectionId}`}
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const input = toInput()
        const errs = validateInspection(inspection, input)
        setErrors(errs)
        if (Object.keys(errs).length === 0) onSubmit(input)
      }}
    >
      <p className="text-sm text-slate-600">
        Inspecting <strong className="tabular-nums text-slate-900">{total}</strong> units. Accepted and rejected must add up to this number.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`acc-${inspection.inspectionId}`} className="mb-1 block text-sm font-medium text-slate-700">
            Accepted units
          </label>
          <input id={`acc-${inspection.inspectionId}`} type="number" min={0} value={accepted} onChange={(e) => changeAccepted(e.target.value)} className={inputCls(!!errors.accepted)} aria-invalid={!!errors.accepted} />
          <FieldError message={errors.accepted} />
        </div>
        <div>
          <label htmlFor={`rej-${inspection.inspectionId}`} className="mb-1 block text-sm font-medium text-slate-700">
            Rejected units
          </label>
          <input id={`rej-${inspection.inspectionId}`} type="number" min={0} value={rejected} onChange={(e) => changeRejected(e.target.value)} className={inputCls(!!errors.rejected)} aria-invalid={!!errors.rejected} />
          <FieldError message={errors.rejected} />
        </div>
        <div className="flex items-end">
          {preview && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              Outcome will be <OrderStatusBadge status={preview} />
            </p>
          )}
        </div>
      </div>
      <FieldError message={errors._form} />

      {r > 0 && (
        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3">
          <legend className="px-1 text-sm font-semibold text-slate-800">Defects</legend>
          {defects.map((d, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[10rem_6rem_1fr_auto]" role="group" aria-label={`Defect ${idx + 1}`}>
              <select aria-label={`Defect ${idx + 1} category`} value={d.category} onChange={(e) => setDefects((s) => s.map((x, i) => (i === idx ? { ...x, category: e.target.value } : x)))} className={inputCls()}>
                <option value="">Category</option>
                {DEFECT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input aria-label={`Defect ${idx + 1} quantity`} type="number" min={1} placeholder="Qty" value={d.quantity} onChange={(e) => setDefects((s) => s.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))} className={inputCls()} />
              <input aria-label={`Defect ${idx + 1} description`} placeholder="What is wrong?" value={d.description} onChange={(e) => setDefects((s) => s.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))} className={inputCls()} />
              <button type="button" aria-label={`Remove defect ${idx + 1}`} onClick={() => setDefects((s) => s.filter((_, i) => i !== idx))} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setDefects((s) => [...s, { category: '', quantity: s.length === 0 ? rejected : '', description: '' }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline">
            <Plus size={15} aria-hidden /> Add defect
          </button>
          <FieldError message={errors.defects} />
        </fieldset>
      )}

      <div>
        <label htmlFor={`in-${inspection.inspectionId}`} className="mb-1 block text-sm font-medium text-slate-700">
          Inspector notes (optional)
        </label>
        <textarea id={`in-${inspection.inspectionId}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls()} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          Save inspection
        </button>
      </div>
    </form>
  )
}
