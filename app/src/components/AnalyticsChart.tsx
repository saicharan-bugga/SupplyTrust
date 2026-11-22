import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export interface AnalyticsChartProps {
  kind: 'doughnut' | 'bar' | 'horizontalBar'
  labels: string[]
  values: number[]
  /** One colour per slice (doughnut) or a single colour for all bars. */
  colors: string | string[]
  /** Text alternative read by screen readers; should state the actual numbers. */
  summary: string
  heightClass?: string
}

/** Chart.js wrapper with a legend where useful and a text summary for assistive technology. */
export function AnalyticsChart({ kind, labels, values, colors, summary, heightClass = 'h-72' }: AnalyticsChartProps) {
  const common = { responsive: true, maintainAspectRatio: false }
  return (
    <div className={heightClass} role="img" aria-label={summary}>
      {kind === 'doughnut' ? (
        <Doughnut
          options={{ ...common, plugins: { legend: { position: 'bottom' } } }}
          data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2 }] }}
        />
      ) : (
        <Bar
          options={{ ...common, indexAxis: kind === 'horizontalBar' ? 'y' : 'x', plugins: { legend: { display: false } } }}
          data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 8 }] }}
        />
      )}
    </div>
  )
}
