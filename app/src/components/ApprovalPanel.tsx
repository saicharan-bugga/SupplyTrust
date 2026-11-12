import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { Decision } from '../lib/workflow'
import type { QualityInspection } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { FieldError, inputCls } from './ui'

export interface ApprovalPanelProps {
  inspection: QualityInspection
  onDecide: (decision: Decision, comments: string) => void
}

const META: Record<Decision, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  Approved: { label: 'Approve', icon: CheckCircle2, cls: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  Rejected: { label: 'Reject', icon: XCircle, cls: 'bg-white text-rose-700 ring-1 ring-rose-300 hover:bg-rose-50' },
  'Reinspection Requested': { label: 'Request reinspection', icon: RotateCcw, cls: 'bg-white text-amber-800 ring-1 ring-amber-300 hover:bg-amber-50' },
}

/** Decision controls. Rejecting asks for confirmation; every decision except a clean approval needs a comment. */
export function ApprovalPanel({ inspection, onDecide }: ApprovalPanelProps) {
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<Decision | null>(null)
  const needsComment = (d: Decision) => d !== 'Approved' || inspection.outcome === 'Failed'

  const go = (d: Decision) => {
    if (needsComment(d) && comments.trim().length < 5) {
      setError('Add a comment of at least 5 characters explaining your decision.')
      return
    }
    setError('')
    if (d === 'Rejected') setConfirm(d)
    else onDecide(d, comments)
  }

  return (
    <div className="space-y-3">
      {inspection.outcome === 'Failed' && (
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800" role="note">
          This inspection failed. Approving accepts only the {inspection.acceptedQuantity} accepted units; the {inspection.rejectedQuantity} rejected units are never accepted.
        </p>
      )}
      <div>
        <label htmlFor={`cm-${inspection.inspectionId}`} className="mb-1 block text-sm font-medium text-slate-700">
          Decision comments
        </label>
        <textarea id={`cm-${inspection.inspectionId}`} rows={2} value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls(!!error)} aria-invalid={!!error} />
        <FieldError message={error} />
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(META) as Decision[]).map((d) => {
          const { icon: Icon, label, cls } = META[d]
          return (
            <button key={d} type="button" onClick={() => go(d)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${cls}`}>
              <Icon size={16} aria-hidden /> {label}
            </button>
          )
        })}
      </div>
      <ConfirmDialog
        open={confirm !== null}
        destructive
        title="Reject this inspection?"
        message="The rejection and your comment are recorded permanently in the audit log."
        confirmLabel="Reject"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          onDecide('Rejected', comments)
          setConfirm(null)
        }}
      />
    </div>
  )
}
