import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApprovalPanel } from '../components/ApprovalPanel'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { Progress, Unauthorized } from '../components/ui'
import { formatDate } from '../lib/derived'
import { can } from '../lib/permissions'
import { awaitingDecision, decisionFor, recordDecision } from '../lib/workflow'
import { useApp } from '../state/AppContext'

export function InspectionDetailPage() {
  const { inspectionId } = useParams()
  const { data, setData, currentUser, notify, visibleOrders } = useApp()
  const insp = data.inspections.find((i) => i.inspectionId === inspectionId)
  const order = visibleOrders.find((o) => o.orderId === insp?.orderId)
  if (!insp || !order) return <Unauthorized text="This inspection was not found, or your role cannot view it." to="/inspections" label="Back to inspections" />

  const vendor = data.vendors.find((v) => v.vendorId === order.vendorId)
  const decisions = data.approvals.filter((a) => a.inspectionId === insp.inspectionId)
  const siblings = data.inspections.filter((i) => i.orderId === insp.orderId && i.inspectionId !== insp.inspectionId)
  const who = (id: string) => data.users.find((u) => u.userId === id)?.name ?? 'Unknown'
  const canDecide = can(currentUser.role, 'inspection.decide') && awaitingDecision(data, insp)
  const rate = insp.inspectedQuantity ? Math.round((insp.rejectedQuantity / insp.inspectedQuantity) * 100) : 0
  const final = decisionFor(data, insp.inspectionId)

  return (
    <div className="space-y-5">
      <Link to="/inspections" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:underline">
        <ArrowLeft size={16} aria-hidden /> Inspections
      </Link>
      <div className="st-rise flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Inspection of {insp.orderId}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {vendor?.name} · {formatDate(insp.inspectedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={insp.outcome} />
          {final && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{final.decision}</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ['Inspected', insp.inspectedQuantity],
          ['Accepted', insp.acceptedQuantity],
          ['Rejected', insp.rejectedQuantity],
          ['Rejection rate', `${rate}%`],
        ].map(([k, v]) => (
          <div key={k} className="st-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      {insp.outcome !== 'Pending Inspection' && (
        <Progress value={insp.acceptedQuantity} max={insp.inspectedQuantity} tone={insp.outcome === 'Failed' ? 'rose' : 'teal'} label="Accepted share of inspected units" />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="st-card p-5" aria-labelledby="df-h">
          <h2 id="df-h" className="mb-3 text-lg font-semibold">
            Defects
          </h2>
          {insp.defects.length === 0 ? (
            <p className="text-sm text-slate-600">No defects recorded.</p>
          ) : (
            <ul className="space-y-2">
              {insp.defects.map((d) => (
                <li key={d.defectId} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">
                    {d.category} <span className="font-normal text-slate-500">× {d.quantity}</span>
                  </p>
                  {d.description && <p className="text-slate-600">{d.description}</p>}
                </li>
              ))}
            </ul>
          )}
          {insp.notes && <p className="mt-3 text-sm text-slate-600">Inspector notes: {insp.notes}</p>}
        </section>

        <section className="st-card p-5" aria-labelledby="dc-h">
          <h2 id="dc-h" className="mb-3 text-lg font-semibold">
            Decision
          </h2>
          {canDecide ? (
            <ApprovalPanel
              inspection={insp}
              onDecide={(decision, comments) => {
                try {
                  setData((d) => recordDecision(d, insp.inspectionId, decision, comments, currentUser.userId))
                  notify(`Decision recorded: ${decision}.`)
                } catch (e) {
                  notify(e instanceof Error ? e.message : 'Could not record the decision.', 'error')
                }
              }}
            />
          ) : decisions.length === 0 ? (
            <p className="text-sm text-slate-600">{insp.outcome === 'Pending Inspection' ? 'Waiting for the inspector.' : 'Awaiting a decision from an authorised approver.'}</p>
          ) : null}
          {decisions.length > 0 && (
            <ul className="space-y-2">
              {decisions.map((a) => (
                <li key={a.approvalId} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{a.decision}</p>
                  <p className="text-slate-600">{a.comments || 'No comment'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {who(a.approverId)} · {formatDate(a.decidedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {siblings.length > 0 && (
        <section className="st-card p-5" aria-labelledby="pv-h">
          <h2 id="pv-h" className="mb-3 text-lg font-semibold">
            Other inspections of this order
          </h2>
          <ul className="space-y-2">
            {siblings.map((s) => (
              <li key={s.inspectionId}>
                <Link to={`/inspections/${s.inspectionId}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm hover:bg-teal-50">
                  <span>
                    {formatDate(s.inspectedAt)} · {s.inspectedQuantity} units
                  </span>
                  <OrderStatusBadge status={s.outcome} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
