import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InspectionForm } from '../components/InspectionForm'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { EmptyState, PageHeader } from '../components/ui'
import { formatDate } from '../lib/derived'
import { can } from '../lib/permissions'
import { completeInspection, decisionFor } from '../lib/workflow'
import { useApp } from '../state/AppContext'

export function InspectionsPage() {
  const { data, setData, currentUser, notify } = useApp()
  const [open, setOpen] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const canRecord = can(currentUser.role, 'inspection.record')
  const vendorOf = (orderId: string) => {
    const o = data.orders.find((x) => x.orderId === orderId)
    return data.vendors.find((v) => v.vendorId === o?.vendorId)?.name ?? 'Unknown vendor'
  }
  const pending = data.inspections.filter((i) => i.outcome === 'Pending Inspection')
  const done = data.inspections.filter((i) => i.outcome !== 'Pending Inspection').sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))

  return (
    <div className="space-y-5">
      <PageHeader title="Quality inspection" subtitle={`${pending.length} pending · ${done.length} completed${canRecord ? '' : ' · view only for your role'}`} />

      <div role="tablist" aria-label="Inspection views" className="inline-flex rounded-xl bg-slate-100 p-1">
        {(['pending', 'done'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${tab === t ? 'bg-white text-teal-800 shadow' : 'text-slate-600'}`}>
            {t === 'pending' ? `Pending (${pending.length})` : `Completed (${done.length})`}
          </button>
        ))}
      </div>

      {tab === 'pending' &&
        (pending.length === 0 ? (
          <EmptyState text="Nothing to inspect. New goods receipts create inspections here." icon={<ShieldCheck size={22} aria-hidden />} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending.map((i) => (
              <li key={i.inspectionId} className="st-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/orders/${i.orderId}`} className="text-lg font-semibold text-teal-800 hover:underline">
                      {i.orderId}
                    </Link>
                    <p className="text-sm text-slate-600">
                      {vendorOf(i.orderId)} · {i.inspectedQuantity} units to inspect
                    </p>
                  </div>
                  <OrderStatusBadge status={i.outcome} />
                </div>
                {open === i.inspectionId ? (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <InspectionForm
                      inspection={i}
                      onCancel={() => setOpen(null)}
                      onSubmit={(input) => {
                        try {
                          setData((d) => completeInspection(d, i.inspectionId, input, currentUser.userId))
                          notify(`Inspection saved for ${i.orderId}. It is now waiting in the approval queue.`)
                          setOpen(null)
                        } catch (e) {
                          notify(e instanceof Error ? e.message : 'Could not save the inspection.', 'error')
                        }
                      }}
                    />
                  </div>
                ) : (
                  canRecord && (
                    <button type="button" onClick={() => setOpen(i.inspectionId)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 hover:bg-teal-800">
                      <ClipboardCheck size={16} aria-hidden /> Start inspection
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        ))}

      {tab === 'done' &&
        (done.length === 0 ? (
          <EmptyState text="No completed inspections yet." />
        ) : (
          <ul className="space-y-3">
            {done.map((i) => {
              const d = decisionFor(data, i.inspectionId)
              return (
                <li key={i.inspectionId}>
                  <Link to={`/inspections/${i.inspectionId}`} className="st-card st-card-hover flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {i.orderId} <span className="font-normal text-slate-600">· {vendorOf(i.orderId)}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {i.inspectedQuantity} inspected · {i.acceptedQuantity} accepted · {i.rejectedQuantity} rejected · {formatDate(i.inspectedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={i.outcome} />
                      <span className="text-xs font-medium text-slate-600">{d ? d.decision : i.outcome === 'Reinspection Required' ? 'Superseded' : 'Awaiting decision'}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
    </div>
  )
}
