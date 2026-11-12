import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { Download, Printer } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { PageHeader, Unauthorized, btnGhost } from '../components/ui'
import { formatMoney, rejectionRate } from '../lib/derived'
import { STATUS_COLORS, statusBreakdown, toCsv, vendorSpend } from '../lib/insights'
import { can } from '../lib/permissions'
import { defectBreakdown, vendorPerformance } from '../lib/workflow'
import { useApp } from '../state/AppContext'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const TEAL = '#0f766e'
const AMBER = '#f59e0b'

export function ReportsPage() {
  const { data, currentUser, notify } = useApp()
  if (!can(currentUser.role, 'reports.view')) return <Unauthorized text="Your role cannot view reports." />

  const breakdown = statusBreakdown(data.orders)
  const spend = vendorSpend(data, data.orders)
  const perf = vendorPerformance(data).sort((a, b) => b.score - a.score)
  const defects = defectBreakdown(data)
  const completed = data.inspections.filter((i) => i.outcome === 'Passed' || i.outcome === 'Failed')
  const rate = rejectionRate(completed)

  const exportCsv = () => {
    const csv = toCsv([
      ['Vendor', 'Orders', 'Value (INR)', 'On-time %', 'Rejection %', 'Score'],
      ...perf.map((p) => [p.name, p.orders, p.value, p.onTimeRate === null ? 'n/a' : Math.round(p.onTimeRate * 100), (p.rejectionRate * 100).toFixed(1), p.score]),
    ])
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendor-performance.csv'
    a.click()
    URL.revokeObjectURL(url)
    notify('Vendor performance exported to CSV.')
  }

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & analytics"
        subtitle="Live numbers calculated from your orders and inspections"
        actions={
          <>
            <button type="button" onClick={exportCsv} className={`${btnGhost} inline-flex items-center gap-2`}>
              <Download size={16} aria-hidden /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className={`${btnGhost} inline-flex items-center gap-2`}>
              <Printer size={16} aria-hidden /> Print / PDF
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Orders', String(data.orders.length)],
          ['Active order value', formatMoney(data.orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.items.reduce((t, i) => t + i.orderedQuantity * i.unitPrice, 0), 0))],
          ['Units inspected', String(completed.reduce((s, i) => s + i.inspectedQuantity, 0))],
          ['Overall rejection rate', `${(rate * 100).toFixed(1)}%`],
        ].map(([k, v]) => (
          <div key={k} className="st-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="st-card p-5" aria-labelledby="c1">
          <h2 id="c1" className="mb-3 text-lg font-semibold">
            Orders by status
          </h2>
          <div className="h-72" role="img" aria-label={`Orders by status: ${breakdown.map((b) => `${b.status} ${b.count}`).join(', ')}`}>
            <Doughnut
              options={chartOpts}
              data={{ labels: breakdown.map((b) => b.status), datasets: [{ data: breakdown.map((b) => b.count), backgroundColor: breakdown.map((b) => STATUS_COLORS[b.status]), borderWidth: 2 }] }}
            />
          </div>
        </section>
        <section className="st-card p-5" aria-labelledby="c2">
          <h2 id="c2" className="mb-3 text-lg font-semibold">
            Spend by vendor (INR)
          </h2>
          <div className="h-72" role="img" aria-label={`Spend by vendor: ${spend.map((s) => `${s.name} ${formatMoney(s.value)}`).join(', ')}`}>
            <Bar
              options={{ ...chartOpts, plugins: { legend: { display: false } } }}
              data={{ labels: spend.map((s) => s.name), datasets: [{ data: spend.map((s) => s.value), backgroundColor: TEAL, borderRadius: 8 }] }}
            />
          </div>
        </section>
        <section className="st-card p-5 lg:col-span-2" aria-labelledby="c3">
          <h2 id="c3" className="mb-3 text-lg font-semibold">
            Defects by category
          </h2>
          {defects.length === 0 ? (
            <p className="text-sm text-slate-600">No defects recorded yet.</p>
          ) : (
            <div className="h-64" role="img" aria-label={`Defects: ${defects.map((d) => `${d.category} ${d.quantity}`).join(', ')}`}>
              <Bar
                options={{ ...chartOpts, indexAxis: 'y' as const, plugins: { legend: { display: false } } }}
                data={{ labels: defects.map((d) => d.category), datasets: [{ data: defects.map((d) => d.quantity), backgroundColor: AMBER, borderRadius: 8 }] }}
              />
            </div>
          )}
        </section>
      </div>

      <section className="st-card st-scroll overflow-x-auto" aria-labelledby="vp">
        <h2 id="vp" className="px-5 pt-5 text-lg font-semibold">
          Vendor performance
        </h2>
        <p className="px-5 text-sm text-slate-500">Score = 50% on-time delivery + 50% quality (1 − rejection rate).</p>
        <table className="mt-3 min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-slate-500">
            <tr>
              {['Vendor', 'Orders', 'Value', 'On-time', 'Rejection', 'Score'].map((h) => (
                <th key={h} scope="col" className="px-5 py-2.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {perf.map((p) => (
              <tr key={p.vendorId}>
                <td className="px-5 py-3 font-medium">{p.name}</td>
                <td className="px-5 py-3 tabular-nums">{p.orders}</td>
                <td className="px-5 py-3 tabular-nums">{formatMoney(p.value)}</td>
                <td className="px-5 py-3 tabular-nums">{p.onTimeRate === null ? 'n/a' : `${Math.round(p.onTimeRate * 100)}%`}</td>
                <td className="px-5 py-3 tabular-nums">{(p.rejectionRate * 100).toFixed(1)}%</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${p.score >= 85 ? 'bg-emerald-50 text-emerald-800 ring-emerald-300' : p.score >= 65 ? 'bg-amber-50 text-amber-800 ring-amber-300' : 'bg-rose-50 text-rose-800 ring-rose-300'}`}>
                    {p.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
