import { useMemo, useState } from 'react'
import { SearchFilterBar } from '../components/SearchFilterBar'
import { PurchaseOrderTable, type SortKey, type SortState } from '../components/PurchaseOrderTable'
import { orderTotal } from '../lib/derived'
import { useApp } from '../state/AppContext'
import type { OrderStatus } from '../types'

const PAGE_SIZE = 8

export function OrdersPage() {
  const { data, visibleOrders } = useApp()
  const [query, setQuery] = useState('')
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

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Purchase orders</h1>
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

      {visibleOrders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No purchase orders yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No records match the current filters.
        </p>
      ) : (
        <>
          <PurchaseOrderTable orders={pageRows} vendors={data.vendors} sort={sort} onSortChange={onSort} />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Showing {pageRows.length} of {filtered.length} orders
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50">
                Previous
              </button>
              <span>
                Page {current} of {pages}
              </span>
              <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
