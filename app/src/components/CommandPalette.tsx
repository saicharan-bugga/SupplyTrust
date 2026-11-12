import { ClipboardList, CornerDownLeft, FileText, Search, Store } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/permissions'
import { useApp } from '../state/AppContext'

interface Item {
  key: string
  label: string
  hint: string
  to: string
  kind: 'Page' | 'Order' | 'Vendor' | 'Inspection'
}

const ICON = { Page: FileText, Order: ClipboardList, Vendor: Store, Inspection: Search }

/** Ctrl/Cmd + K launcher: jump to any page, order, vendor or inspection with the keyboard. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, currentUser, visibleOrders } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(() => {
    const pages = NAV_ITEMS.filter((n) => n.roles.includes(currentUser.role)).map((n) => ({ key: `p${n.to}`, label: n.label, hint: 'Go to page', to: n.to, kind: 'Page' as const }))
    const orders = visibleOrders.map((o) => ({
      key: `o${o.orderId}`,
      label: o.orderId,
      hint: `${data.vendors.find((v) => v.vendorId === o.vendorId)?.name ?? ''} · ${o.status}`,
      to: `/orders/${o.orderId}`,
      kind: 'Order' as const,
    }))
    const canSeeVendors = NAV_ITEMS.find((n) => n.to === '/vendors')!.roles.includes(currentUser.role)
    const vendors = canSeeVendors ? data.vendors.map((v) => ({ key: `v${v.vendorId}`, label: v.name, hint: `Vendor · ${v.status}`, to: '/vendors', kind: 'Vendor' as const })) : []
    return [...pages, ...orders, ...vendors]
  }, [data.vendors, visibleOrders, currentUser.role])

  const results = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (n ? items.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(n)) : items).slice(0, 8)
  }, [items, q])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal?.()
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    if (!open && d.open) d.close?.()
  }, [open])

  const go = (i?: Item) => {
    if (!i) return
    onClose()
    navigate(i.to)
  }

  return (
    <dialog
      ref={ref}
      aria-label="Command palette"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl p-0 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4">
        <Search size={18} aria-hidden className="text-slate-600" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(results[active])
            }
          }}
          role="combobox"
          aria-expanded
          aria-controls="cmd-list"
          aria-label="Search pages, orders and vendors"
          placeholder="Jump to a page, order or vendor…"
          className="w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-600"
        />
        <kbd className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-600">Esc</kbd>
      </div>
      <ul id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-600">Nothing matches “{q}”.</li>}
        {results.map((r, n) => {
          const Icon = ICON[r.kind]
          return (
            <li key={r.key} role="option" aria-selected={n === active}>
              <button type="button" onMouseEnter={() => setActive(n)} onClick={() => go(r)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${n === active ? 'bg-teal-50 text-teal-900' : 'text-slate-700'}`}>
                <Icon size={16} aria-hidden className="shrink-0 text-teal-700" />
                <span className="font-medium">{r.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{r.hint}</span>
                {n === active && <CornerDownLeft size={14} aria-hidden className="text-teal-700" />}
              </button>
            </li>
          )
        })}
      </ul>
    </dialog>
  )
}
