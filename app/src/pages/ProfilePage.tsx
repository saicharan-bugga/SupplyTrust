import { BadgeCheck, Building2, CheckCircle2, Hash, Moon, Pencil, ShieldCheck, Sun, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, btnGhost, btnPrimary, inputCls } from '../components/ui'
import { formatDate } from '../lib/derived'
import { initials } from '../lib/insights'
import { PERMISSION_LABELS, permissionsFor } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import { ROLE_LABELS } from '../types'

const ROLE_BLURB: Record<string, string> = {
  procurement_officer: 'Creates purchase orders, manages vendors and makes the final quality decisions.',
  procurement_manager: 'Oversees delays and pending approvals, and can decide on inspections.',
  vendor: 'Sees only their own orders and keeps delivery dates up to date.',
  quality_inspector: 'Inspects delivered goods and records accepted and rejected units.',
  warehouse_receiver: 'Records the goods that arrive against each purchase order.',
}

/** Signed-in user's profile: basic details, role permissions, personal activity and preferences. */
export function ProfilePage() {
  const { data, setData, currentUser, setCurrentUserId, theme, toggleTheme, notify } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser.name)
  const [error, setError] = useState('')
  const vendor = data.vendors.find((v) => v.vendorId === currentUser.vendorId)
  const perms = permissionsFor(currentUser.role)

  const activity = useMemo(() => {
    const mine = [
      ...data.history.filter((h) => h.changedBy === currentUser.userId).map((h) => ({
        id: h.historyId,
        at: h.changedAt,
        text: h.previousStatus ? `${h.orderId}: ${h.previousStatus} to ${h.newStatus}` : `${h.orderId} created as ${h.newStatus}`,
      })),
      ...data.audit.filter((a) => a.actorId === currentUser.userId).map((a) => ({ id: a.auditId, at: a.at, text: `${a.action}${a.orderId ? ` · ${a.orderId}` : ''}` })),
    ].sort((a, b) => b.at.localeCompare(a.at))
    return { list: mine.slice(0, 6), total: mine.length }
  }, [data.history, data.audit, currentUser.userId])
  const decisions = data.approvals.filter((a) => a.approverId === currentUser.userId).length

  const saveName = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = name.trim()
    if (clean.length < 2) return setError('Enter a name of at least 2 characters')
    setData((d) => ({ ...d, users: d.users.map((u) => (u.userId === currentUser.userId ? { ...u, name: clean } : u)) }))
    notify('Profile updated.')
    setError('')
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" subtitle="Your details, what your role can do, and your recent activity" />

      <section className="st-hero st-rise p-6 sm:p-8" aria-label="Profile summary">
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-2xl font-bold text-amber-950 shadow-lg ring-4 ring-white/20">
            {initials(currentUser.name)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{ROLE_LABELS[currentUser.role]}</p>
            <p className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              {currentUser.name}
            </p>
            <p className="mt-1 text-sm text-teal-50/80">{ROLE_BLURB[currentUser.role]}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="st-card p-5" aria-labelledby="pd">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="pd">Basic details</h2>
            {!editing && (
              <button type="button" onClick={() => { setName(currentUser.name); setEditing(true) }} className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 hover:underline">
                <Pencil size={14} aria-hidden /> Edit name
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveName} noValidate className="space-y-3" aria-label="Edit profile">
              <div>
                <label htmlFor="pf-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Display name
                </label>
                <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls(!!error)} aria-invalid={!!error} />
                {error && (
                  <p role="alert" className="mt-1 text-xs text-rose-700">
                    {error}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" className={btnPrimary}>
                  Save
                </button>
                <button type="button" onClick={() => { setEditing(false); setError('') }} className={btnGhost}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-3 text-sm">
              {[
                [UserRound, 'Name', currentUser.name],
                [BadgeCheck, 'Role', ROLE_LABELS[currentUser.role]],
                [Hash, 'User ID', currentUser.userId],
                ...(vendor ? [[Building2, 'Vendor company', vendor.name] as const] : []),
              ].map(([Icon, k, v]) => (
                <div key={String(k)} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                  <dt className="flex items-center gap-3 text-slate-600">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-teal-800" aria-hidden>
                      <Icon size={16} />
                    </span>
                    {String(k)}
                  </dt>
                  <dd className="text-right font-medium text-slate-900">{String(v)}</dd>
                </div>
              ))}
              {vendor && (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  {vendor.email} · {vendor.contact}
                </p>
              )}
            </dl>
          )}
        </section>

        <section className="st-card p-5" aria-labelledby="pp">
          <h2 id="pp" className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} aria-hidden className="text-teal-700" /> What you can do
          </h2>
          <ul className="space-y-2 text-sm">
            {perms.map((p) => (
              <li key={p} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 size={16} aria-hidden className="mt-0.5 shrink-0 text-emerald-600" />
                {PERMISSION_LABELS[p]}
              </li>
            ))}
          </ul>
        </section>

        <section className="st-card p-5" aria-labelledby="pa">
          <h2 id="pa" className="mb-4">
            Your activity
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Recorded actions</p>
              <p className="text-2xl font-semibold tabular-nums">{activity.total}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Quality decisions</p>
              <p className="text-2xl font-semibold tabular-nums">{decisions}</p>
            </div>
          </div>
          {activity.list.length === 0 ? (
            <p className="text-sm text-slate-600">No activity yet. Actions you take appear here and in the audit log.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {activity.list.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 py-2">
                  <span className="text-slate-800">{a.text}</span>
                  <span className="shrink-0 text-xs text-slate-600">{formatDate(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="st-card p-5" aria-labelledby="ps">
          <h2 id="ps" className="mb-4">
            Preferences and account
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Theme</p>
                <p className="text-xs text-slate-600">Currently {theme}</p>
              </div>
              <button type="button" onClick={toggleTheme} className={`${btnGhost} inline-flex items-center gap-2`}>
                {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />} Switch to {theme === 'dark' ? 'light' : 'dark'}
              </button>
            </div>
            <div>
              <label htmlFor="pf-switch" className="mb-1 block text-sm font-medium text-slate-900">
                Switch demo user
              </label>
              <select id="pf-switch" value={currentUser.userId} onChange={(e) => setCurrentUserId(e.target.value)} className={inputCls()}>
                {data.users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} - {ROLE_LABELS[u.role]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-600">This demo has no passwords; switching shows each role's view.</p>
            </div>
            <Link to="/settings" className="inline-block text-sm font-medium text-teal-800 hover:underline">
              Go to settings (reset demo data)
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
