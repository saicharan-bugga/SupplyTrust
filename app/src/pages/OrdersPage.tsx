import { ChevronLeft, ChevronRight, Download, Inbox, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchFilterBar } from '../components/SearchFilterBar'
import { PurchaseOrderTable, type SortKey, type SortState } from '../components/PurchaseOrderTable'
import { formatMoney, orderTotal } from '../lib/derived'
import { STATUS_COLORS, toCsv } from '../lib/insights'
import { can } from '../lib/permissions'
import { useApp } from '../state/AppContext'
import type { OrderStatus } from '../types'

const PAGE_SIZE = 8

export function OrdersPage() {
  const { data, visibleOrders, notify, currentUser } = useApp()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [status, setStatus] = useState<OrderStatus | 'All'>('All')
  const [sort, setSort] = useState<SortState>({ key: 'orderId', dir: 'desc' })
  const [page, setPage] = useState(1)

  const vendorName = (id: string) => data.vendors.find((v) => v.vendorId === id)?.name ?? ''

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = visibleOrders.filter(
      (o) =>
        (status === 'All' || o.status === status) &&
        (q === '' || o.orderId.toLowerCase().includes(q) || vendorName(o.vendorId).toLowerCase().includes(q)),
    )
    const val = (o: (typeof rows)[number]): string | number =>
      sort.key === 'vendor' ? vendorName(o.vendorId) : sort.key === 'total' ? orderTotal(o) : o[sort.key]
    rows.sort((a, b) => {
      const x = val(a)
      const y = val(b)
      const c = x < y ? -1 : x > y ? 1 : 0
      return sort.dir === 'asc' ? c : -c
    })
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleOrders, query, status, sort, data.vendors])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const filteredValue = filtered.reduce((s, o) => s + orderTotal(o), 0)

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const exportCsv = () => {
    const csv = toCsv([
      ['Order', 'Vendor', 'Status', 'Value (INR)', 'Expected delivery'],
      ...filtered.map((o) => [o.orderId, vendorName(o.vendorId), o.status, orderTotal(o), o.expectedDeliveryDate]),
    ])
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify(`Exported ${filtered.length} orders to CSV.`)
  }

  const chips: (OrderStatus | 'All')[] = ['All', 'Pending Approval', 'Ordered', 'Partially Received', 'Received']

  return (
    <div className="space-y-5">
      <div className="st-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Purchase orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            {filtered.length} {filtered.length === 1 ? 'order' : 'orders'} · {formatMoney(filteredValue)} total value
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        {can(currentUser.role, 'order.create') && (
          <Link to="/orders/new" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/30 hover:bg-teal-800">
            <Plus size={16} aria-hidden /> New order
          </Link>
        )}
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-teal-800 disabled:opacity-50"
        >
          <Download size={16} aria-hidden /> Export CSV
        </button>
        </div>
      </div>

      <div className="st-card st-rise p-4" style={{ ['--d' as string]: '0.05s' }}>
        <SearchFilterBar
          query={query}
          status={status}
          onQueryChange={(q) => {
            setQuery(q)
            setPage(1)
          }}
          onStatusChange={(s) => {
            setStatus(s)
            setPage(1)
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Quick status filters" role="group">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={status === c}
              onClick={() => {
                setStatus(c)
                setPage(1)
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                status === c ? 'bg-teal-700 text-white shadow-md shadow-teal-700/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c !== 'All' && <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[c] }} />}
              {c === 'All' ? 'All orders' : c}
            </button>
          ))}
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <EmptyState text="No purchase orders yet." action={can(currentUser.role, 'order.create')} />
      ) : filtered.length === 0 ? (
        <EmptyState text="No records match the current filters." />
      ) : (
        <>
          <PurchaseOrderTable orders={pageRows} vendors={data.vendors} sort={sort} onSortChange={onSort} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              Showing {pageRows.length} of {filtered.length} orders
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft size={14} aria-hidden /> Previous
              </button>
              <span>
                Page {current} of {pages}
              </span>
              <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">
                Next <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState({ text, action = false }: { text: string; action?: boolean }) {
  return (
    <div className="st-card flex flex-col items-center gap-3 p-10 text-center text-slate-600">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Inbox size={22} aria-hidden />
      </span>
      <p>{text}</p>
      {action && (
        <Link to="/orders/new" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          Create the first order
        </Link>
      )}
    </div>
  )
}
