export type WidgetId = 'tasks' | 'kpis' | 'pipeline' | 'quality' | 'spend' | 'upcoming' | 'delayed' | 'pending' | 'activity'

export interface WidgetDef {
  id: WidgetId
  label: string
  /** Columns taken on the 6-column desktop grid. */
  span: 2 | 3 | 4 | 6
}

export const WIDGETS: WidgetDef[] = [
  { id: 'tasks', label: 'My tasks', span: 6 },
  { id: 'kpis', label: 'Key numbers', span: 6 },
  { id: 'pipeline', label: 'Order pipeline', span: 4 },
  { id: 'quality', label: 'Quality health', span: 2 },
  { id: 'spend', label: 'Spend by vendor', span: 3 },
  { id: 'upcoming', label: 'Upcoming deliveries', span: 3 },
  { id: 'delayed', label: 'Delayed orders', span: 3 },
  { id: 'pending', label: 'Awaiting approval', span: 3 },
  { id: 'activity', label: 'Recent activity', span: 6 },
]

export interface DashboardLayout {
  order: WidgetId[]
  hidden: WidgetId[]
}

export const DEFAULT_LAYOUT: DashboardLayout = { order: WIDGETS.map((w) => w.id), hidden: [] }

const IDS = new Set<string>(WIDGETS.map((w) => w.id))

/** Turn anything read from storage into a valid layout: drop unknown ids, append widgets added later. */
export function normalizeLayout(raw: unknown): DashboardLayout {
  const r = (raw ?? {}) as Partial<Record<keyof DashboardLayout, unknown>>
  const clean = (v: unknown): WidgetId[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is WidgetId => typeof x === 'string' && IDS.has(x)))] : [])
  const order = clean(r.order)
  for (const w of DEFAULT_LAYOUT.order) if (!order.includes(w)) order.push(w)
  return { order, hidden: clean(r.hidden) }
}

export function moveWidget(layout: DashboardLayout, id: WidgetId, dir: -1 | 1): DashboardLayout {
  const i = layout.order.indexOf(id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= layout.order.length) return layout
  const order = [...layout.order]
  ;[order[i], order[j]] = [order[j], order[i]]
  return { ...layout, order }
}

export function toggleWidget(layout: DashboardLayout, id: WidgetId): DashboardLayout {
  return { ...layout, hidden: layout.hidden.includes(id) ? layout.hidden.filter((h) => h !== id) : [...layout.hidden, id] }
}

export const visibleWidgets = (layout: DashboardLayout): WidgetId[] => layout.order.filter((id) => !layout.hidden.includes(id))

export const isDefaultLayout = (layout: DashboardLayout): boolean => JSON.stringify(layout) === JSON.stringify(DEFAULT_LAYOUT)

const keyFor = (userId: string) => `supplytrust.dashboard.v1.${userId}`

export function loadLayout(userId: string): DashboardLayout {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    return raw ? normalizeLayout(JSON.parse(raw)) : DEFAULT_LAYOUT
  } catch {
    return DEFAULT_LAYOUT
  }
}

export function saveLayout(userId: string, layout: DashboardLayout): void {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(layout))
  } catch {
    /* storage unavailable: layout lasts for this session only */
  }
}
