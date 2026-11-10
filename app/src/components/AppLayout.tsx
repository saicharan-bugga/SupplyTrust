import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import { ROLE_LABELS } from '../types'
import { LogoMark, LogoWordmark } from './Logo'
import { ToastRegion } from './NotificationToast'

export function AppLayout() {
  const { currentUser, data, setCurrentUserId, playIntro } = useApp()
  const [open, setOpen] = useState(false)
  const items = NAV_ITEMS.filter((n) => n.roles.includes(currentUser.role))

  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-b from-ink-900 to-ink-950 text-slate-100 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              playIntro()
            }}
            className="flex items-center gap-2.5 rounded-lg text-lg transition-transform hover:scale-[1.03]"
            aria-label="SupplyTrust - replay intro animation"
            title="Replay intro"
          >
            <LogoMark size={30} />
            <LogoWordmark />
          </button>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={20} aria-hidden />
          </button>
        </div>
        <nav aria-label="Main" className="px-3 pb-6">
          <ul className="space-y-1">
            {items.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-amber-400 bg-white/10 text-white'
                        : 'border-transparent text-teal-100/75 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b-2 border-brand-500/20 bg-white/90 px-4 backdrop-blur">
          <button type="button" className="rounded p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={20} aria-hidden />
          </button>
          <div className="flex-1" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Demo user</span>
            <select
              value={currentUser.userId}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
            >
              {data.users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name} - {ROLE_LABELS[u.role]}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <ToastRegion />
    </div>
  )
}
