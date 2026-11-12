import { CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ApprovalPanel } from '../components/ApprovalPanel'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { EmptyState, PageHeader } from '../components/ui'
import { formatDate } from '../lib/derived'
import { can } from '../lib/permissions'
import { awaitingDecision, recordDecision } from '../lib/workflow'
import { useApp } from '../state/AppContext'

export function ApprovalsPage() {
  const { data, setData, currentUser, notify } = useApp()
  const canDecide = can(currentUser.role, 'inspection.decide')
  const queue = data.inspections.filter((i) => awaitingDecision(data, i))
  const decided = [...data.approvals].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
  const who = (id: string) => data.users.find((u) => u.userId === id)?.name ?? 'Unknown'
  const orderOf = (inspectionId: string) => data.inspections.find((i) => i.inspectionId === inspectionId)?.orderId ?? ''
  const vendorOf = (orderId: string) => {
    const o = data.orders.find((x) => x.orderId === orderId)
    return data.vendors.find((v) => v.vendorId === o?.vendorId)?.name ?? 'Unknown vendor'
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Approval queue" subtitle={`${queue.length} ${queue.length === 1 ? 'inspection' : 'inspections'} awaiting a decision`} />
      {queue.length === 0 ? (
        <EmptyState text="All caught up. Completed inspections appear here for approval." icon={<CheckCheck size={22} aria-hidden />} />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {queue.map((i) => (
            <li key={i.inspectionId} className="st-card st-rise p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link to={`/inspections/${i.inspectionId}`} className="text-lg font-semibold text-teal-800 hover:underline">
                    {i.orderId}
                  </Link>
                  <p className="text-sm text-slate-600">{vendorOf(i.orderId)}</p>
                </div>
                <OrderStatusBadge status={i.outcome} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {i.inspectedQuantity} inspected · <strong className="text-emerald-700">{i.acceptedQuantity} accepted</strong> · <strong className="text-rose-700">{i.rejectedQuantity} rejected</strong>
              </p>
              {i.defects.length > 0 && <p className="mt-1 text-xs text-slate-500">Defects: {i.defects.map((d) => `${d.category} (${d.quantity})`).join(', ')}</p>}
              <div className="mt-4 border-t border-slate-100 pt-4">
                {canDecide ? (
                  <ApprovalPanel
                    inspection={i}
                    onDecide={(decision, comments) => {
                      try {
                        setData((d) => recordDecision(d, i.inspectionId, decision, comments, currentUser.userId))
                        notify(`${i.orderId}: ${decision}.`)
                      } catch (e) {
                        notify(e instanceof Error ? e.message : 'Could not record the decision.', 'error')
                      }
                    }}
                  />
                ) : (
                  <p className="text-sm text-slate-500">Your role cannot approve or reject inspections.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="st-card p-5" aria-labelledby="dh">
        <h2 id="dh" className="mb-3 text-lg font-semibold">
          Decision history
        </h2>
        {decided.length === 0 ? (
          <p className="text-sm text-slate-600">No decisions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {decided.map((a) => (
              <li key={a.approvalId} className="py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {orderOf(a.inspectionId)} · {a.decision}
                  </span>
                  <span className="text-xs text-slate-500">
                    {who(a.approverId)} · {formatDate(a.decidedAt)}
                  </span>
                </div>
                <p className="text-slate-600">{a.comments || 'No comment'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
