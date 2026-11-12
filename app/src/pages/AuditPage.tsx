import { Download, ScrollText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, PageHeader, Unauthorized, btnGhost, inputCls } from '../components/ui'
import { toCsv } from '../lib/insights'
import { can } from '../lib/permissions'
import { useApp } from '../state/AppContext'

interface Row {
  id: string
  at: string
  orderId?: string
  actor: string
  action: string
  detail: string
}

/** One merged, newest-first trail: status changes plus receipts, inspections, decisions and delivery-date updates. */
export function AuditPage() {
  const { data, currentUser, notify } = useApp()
  const [q, setQ] = useState('')
  const who = (id: string) => data.users.find((u) => u.userId === id)?.name ?? 'Unknown'

  const rows = useMemo<Row[]>(() => {
    const fromHistory = data.history.map((h) => ({
      id: h.historyId,
      at: h.changedAt,
      orderId: h.orderId,
      actor: who(h.changedBy),
      action: 'Status changed',
      detail: h.previousStatus ? `${h.previousStatus} to ${h.newStatus}` : `Created as ${h.newStatus}`,
    }))
    const fromAudit = data.audit.map((a) => ({ id: a.auditId, at: a.at, orderId: a.orderId, actor: who(a.actorId), action: a.action, detail: a.detail }))
    return [...fromHistory, ...fromAudit].sort((a, b) => b.at.localeCompare(a.at))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.history, data.audit, data.users])

  if (!can(currentUser.role, 'audit.view')) return <Unauthorized text="Only procurement roles can view the audit log." />

  const needle = q.trim().toLowerCase()
  const shown = needle ? rows.filter((r) => `${r.orderId} ${r.actor} ${r.action} ${r.detail}`.toLowerCase().includes(needle)) : rows

  const exportCsv = () => {
    const csv = toCsv([['When', 'Order', 'Who', 'Action', 'Detail'], ...shown.map((r) => [r.at, r.orderId ?? '', r.actor, r.action, r.detail])])
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-log.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify(`Exported ${shown.length} audit entries.`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        subtitle={`${rows.length} recorded events · who did what, and when`}
        actions={
          <button type="button" onClick={exportCsv} disabled={shown.length === 0} className={`${btnGhost} inline-flex items-center gap-2 disabled:opacity-50`}>
            <Download size={16} aria-hidden /> Export CSV
          </button>
        }
      />
      <div className="st-card p-4">
        <label htmlFor="audit-q" className="sr-only">
          Filter audit log
        </label>
        <input id="audit-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by order, person, action…" className={inputCls()} />
      </div>
      {shown.length === 0 ? (
        <EmptyState text="No audit events match." icon={<ScrollText size={22} aria-hidden />} />
      ) : (
        <ol className="st-card divide-y divide-slate-100">
          {shown.slice(0, 100).map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 px-5 py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">
                  {r.action}
                  {r.orderId && (
                    <>
                      {' · '}
                      <Link to={`/orders/${r.orderId}`} className="text-teal-800 hover:underline">
                        {r.orderId}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-slate-600">{r.detail}</p>
              </div>
              <p className="text-xs text-slate-500">
                {r.actor} · {new Date(r.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: r.at.length > 10 ? 'short' : undefined })}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
