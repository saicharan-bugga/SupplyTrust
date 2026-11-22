import { ChevronDown, Download } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export interface ExportOption {
  label: string
  onSelect: () => void
}

export interface ExportMenuProps {
  options: ExportOption[]
  disabled?: boolean
  label?: string
}

/** Small accessible dropdown for export actions (CSV, print / PDF). Closes on Escape and outside click. */
export function ExportMenu({ options, disabled = false, label = 'Export' }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="st-no-print relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <Download size={16} aria-hidden /> {label} <ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <ul id={id} role="menu" className="st-card absolute right-0 z-30 mt-2 w-48 overflow-hidden p-1">
          {options.map((o) => (
            <li key={o.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  o.onSelect()
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-teal-50"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
