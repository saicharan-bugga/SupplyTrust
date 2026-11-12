import {
  Bell,
  CheckCheck,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Moon,
  PackageCheck,
  ScrollText,
  Search,
  Settings,
  Sun,
  ShieldCheck,
  Store,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { delayDays, isDelayed } from '../lib/derived'
import { initials } from '../lib/insights'
import { NAV_ITEMS } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import { ROLE_LABELS } from '../types'
import { CommandPalette } from './CommandPalette'
import { LogoMark, LogoWordmark } from './Logo'
import { ToastRegion } from './NotificationToast'

const ICONS: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/orders': ClipboardList,
  '/vendors': Store,
  '/receipts': PackageCheck,
  '/inspections': ShieldCheck,
  '/approvals': CheckCheck,
  '/reports': TrendingUp,
  '/audit': ScrollText,
  '/settings': Settings,
}

export function AppLayout() {
  const { currentUser, data, setCurrentUserId, visibleOrders, theme, toggleTheme } = useApp()
  const [palette, setPalette] = useState(false)
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const items = NAV_ITEMS.filter((n) => n.roles.includes(currentUser.role))
  const current = NAV_ITEMS.find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)))

  const delayed = useMemo(() => visibleOrders.filter((o) => isDelayed(o)), [visibleOrders])
  const pending = useMemo(() => visibleOrders.filter((o) => o.status === 'Pending Approval'), [visibleOrders])
  const badges: Record<string, number> = { '/orders': delayed.length, '/approvals': pending.length }
  const alertCount = delayed.length + pending.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
      if (e.key === 'Escape') setBell(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the notifications panel when clicking or tapping anywhere outside it.
  useEffect(() => {
    if (!bell) return
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setBell(false)
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [bell])

  const goOrder = (id: string) => {
    setBell(false)
    navigate(`/orders?q=${id}`)
  }

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>

      {/* Spacer keeps the icon rail's width in the layout; the real sidebar is fixed on top. */}
      <div className={`w-[72px] shrink-0 transition-[width] duration-300 ${open ? 'lg:w-64' : ''}`} aria-hidden />
      <aside
        className={`st-sidebar fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-[#0a1a30] text-slate-100 transition-[width] duration-300 ${
          open ? 'w-64' : 'w-[72px]'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-teal-50 transition hover:bg-white/10"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
          >
            <Menu size={22} aria-hidden />
          </button>
          {open && (
            <div className="flex items-center gap-2.5 whitespace-nowrap text-lg">
              <LogoMark size={30} />
              <LogoWordmark />
            </div>
          )}
        </div>

        {!open && (
          <div className="flex justify-center pb-2">
            <LogoMark size={34} />
          </div>
        )}

        {open && <p className="whitespace-nowrap px-6 pb-2 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-teal-200/40">Workspace</p>}
        <nav aria-label="Main" className="st-scroll flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
          <ul className="space-y-1">
            {items.map((n) => {
              const Icon = ICONS[n.to] ?? LayoutDashboard
              const count = badges[n.to] ?? 0
              return (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    title={open ? undefined : n.label}
                    onClick={() => window.matchMedia('(max-width: 1023px)').matches && setOpen(false)}
                    className={({ isActive }) =>
                      `st-nav-link relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                        open ? 'gap-3 px-3' : 'justify-center px-0'
                      } ${isActive ? 'active bg-white/10 text-white' : 'text-teal-100/75 hover:bg-white/5 hover:text-white'}`
                    }
                  >
                    <span className="relative flex shrink-0">
                      <Icon size={20} aria-hidden className="st-nav-icon" />
                      {!open && count > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#0a1a30]" aria-hidden />}
                    </span>
                    <span className={open ? 'flex-1 whitespace-nowrap' : 'sr-only'}>{n.label}</span>
                    {open && count > 0 && (
                      <span className="rounded-full bg-amber-400/90 px-1.5 text-[0.65rem] font-bold text-amber-950" aria-hidden>
                        {count}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`m-3 rounded-2xl bg-white/5 ring-1 ring-white/10 ${open ? 'p-3' : 'flex justify-center p-2'}`}>
          <div className="flex items-center gap-3">
            <span
              title={open ? undefined : `${currentUser.name} - ${ROLE_LABELS[currentUser.role]}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-sm font-bold text-amber-950"
            >
              {initials(currentUser.name)}
            </span>
            {open && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-teal-100/60">{ROLE_LABELS[currentUser.role]}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-900/5 bg-white/75 px-4 backdrop-blur-xl sm:px-6">
          <div className="hidden min-w-0 md:block">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-600">SupplyTrust</p>
            <p className="truncate text-sm font-semibold text-slate-800">{current?.label ?? 'Workspace'}</p>
          </div>

          <form
            role="search"
            className="relative mx-auto hidden w-full max-w-md flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/orders${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
            }}
          >
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Quick search orders"
              placeholder="Search orders or vendors…"
              className="w-full rounded-xl border-0 bg-slate-900/5 py-2 pl-10 pr-14 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-teal-500/40"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 lg:block">
              Ctrl K
            </kbd>
          </form>

          <div className="flex-1 sm:hidden" />

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-900/5"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={19} aria-hidden /> : <Moon size={19} aria-hidden />}
          </button>

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setBell((b) => !b)}
              className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-900/5"
              aria-label={`Notifications (${alertCount})`}
              aria-expanded={bell}
            >
              <Bell size={19} aria-hidden />
              {alertCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white ring-2 ring-white">
                  {alertCount}
                </span>
              )}
            </button>
            {bell && (
              <div className="st-card st-rise absolute right-0 top-12 z-30 w-80 max-w-[85vw] p-2" role="region" aria-label="Notifications">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Needs your attention</p>
                {alertCount === 0 && <p className="px-3 pb-3 text-sm text-slate-600">You're all caught up.</p>}
                <ul className="max-h-72 overflow-y-auto">
                  {delayed.map((o) => (
                    <li key={o.orderId}>
                      <button type="button" onClick={() => goOrder(o.orderId)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                        <span className="text-sm">
                          <strong>{o.orderId}</strong> is {delayDays(o)} days overdue
                        </span>
                      </button>
                    </li>
                  ))}
                  {pending.map((o) => (
                    <li key={o.orderId}>
                      <button type="button" onClick={() => goOrder(o.orderId)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                        <span className="text-sm">
                          <strong>{o.orderId}</strong> is waiting for approval
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden xl:inline">Demo user</span>
            <select
              value={currentUser.userId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="max-w-[11rem] rounded-xl border-0 bg-slate-900/5 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition hover:bg-slate-900/10 focus:ring-2 focus:ring-teal-500/40 sm:max-w-none"
            >
              {data.users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name} - {ROLE_LABELS[u.role]}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-slate-600">SupplyTrust · Order. Inspect. Approve.</footer>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <ToastRegion />
    </div>
  )
}
