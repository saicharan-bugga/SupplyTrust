import { AnalyticsChart } from '../components/AnalyticsChart'
import { ExportMenu } from '../components/ExportMenu'
import { VendorOrderPanel } from '../components/VendorOrderPanel'
import { EmptyState, PageHeader, Unauthorized } from '../components/ui'
import { formatMoney, isDelayed, orderTotal, orderedQuantity, receivedQuantity } from '../lib/derived'
import { STATUS_COLORS, statusBreakdown, toCsv } from '../lib/insights'
import { can } from '../lib/permissions'
import { updateEta, vendorPerformance } from '../lib/workflow'
import { useApp } from '../state/AppContext'

/** Vendor Portal: a vendor sees only their own orders, delivery progress, quality feedback and can update delivery dates. */
export function VendorPortalPage() {
  const { data, currentUser, visibleOrders, setData, notify } = useApp()
  if (currentUser.role !== 'vendor' || !can(currentUser.role, 'order.updateFulfillment')) {
    return <Unauthorized text="The Vendor Portal is only for vendor accounts." />
  }

  const orders = visibleOrders.filter((o) => o.status !== 'Draft')
  const active = orders.filter((o) => o.status === 'Ordered' || o.status === 'Partially Received')
  const late = orders.filter((o) => isDelayed(o))
  const mine = vendorPerformance(data).find((p) => p.vendorId === currentUser.vendorId)
  const breakdown = statusBreakdown(orders)

  const exportCsv = () => {
    const csv = toCsv([
      ['Order', 'Status', 'Ordered', 'Received', 'Due', 'Value (INR)'],
      ...orders.map((o) => [o.orderId, o.status, orderedQuantity(o), receivedQuantity(data, o.orderId), o.expectedDeliveryDate, orderTotal(o)]),
    ])
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify('Your orders were exported to CSV.')
  }

  const onUpdateEta = (orderId: string, date: string) => {
    try {
      setData((prev) => updateEta(prev, orderId, date, currentUser.userId))
      notify(`Delivery date for ${orderId} updated.`)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not update the date.', 'error')
    }
  }

  const stats: [string, string][] = [
    ['My orders', String(orders.length)],
    ['Awaiting delivery', String(active.length)],
    ['Running late', String(late.length)],
    ['Performance score', mine ? String(mine.score) : 'n/a'],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor portal"
        subtitle={`Orders placed with your company, ${formatMoney(orders.reduce((s, o) => s + orderTotal(o), 0))} in total`}
        actions={
          <ExportMenu
            options={[
              { label: 'Download CSV', onSelect: exportCsv },
              { label: 'Print / PDF', onSelect: () => window.print() },
            ]}
            disabled={orders.length === 0}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="st-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState text="No orders have been placed with you yet." />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            {orders.map((o) => (
              <VendorOrderPanel key={o.orderId} data={data} order={o} onUpdateEta={(d) => onUpdateEta(o.orderId, d)} />
            ))}
          </div>
          <section className="st-card h-fit p-5" aria-labelledby="vp-status">
            <h2 id="vp-status" className="mb-3 text-lg font-semibold">
              Orders by status
            </h2>
            <AnalyticsChart
              kind="doughnut"
              labels={breakdown.map((b) => b.status)}
              values={breakdown.map((b) => b.count)}
              colors={breakdown.map((b) => STATUS_COLORS[b.status])}
              summary={`Orders by status: ${breakdown.map((b) => `${b.status} ${b.count}`).join(', ')}`}
            />
          </section>
        </div>
      )}
    </div>
  )
}
