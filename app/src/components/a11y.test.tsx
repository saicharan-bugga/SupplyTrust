import { render, waitFor } from '@testing-library/react'
import axe from 'axe-core'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppLayout } from './AppLayout'
import { AppProvider } from '../state/AppContext'
import { ApprovalsPage } from '../pages/ApprovalsPage'
import { AuditPage } from '../pages/AuditPage'
import { DashboardPage } from '../pages/DashboardPage'
import { InspectionsPage } from '../pages/InspectionsPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { OrderFormPage } from '../pages/OrderFormPage'
import { OrdersPage } from '../pages/OrdersPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ReceiptsPage } from '../pages/ReceiptsPage'
import { VendorsPage } from '../pages/VendorsPage'

// Automated WCAG 2.x A/AA checks (axe-core) on every main screen. Colour contrast needs a real renderer,
// so it is verified separately in the browser; here we check structure, names, labels and roles.
const PAGES: [string, string][] = [
  ['/', 'dashboard'],
  ['/orders', 'orders list'],
  ['/orders/PO-2026-002', 'order details'],
  ['/orders/new', 'create order form'],
  ['/vendors', 'vendors'],
  ['/receipts', 'goods receipt'],
  ['/inspections', 'inspections'],
  ['/approvals', 'approval queue'],
  ['/audit', 'audit log'],
  ['/profile', 'profile'],
]

function Shell({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AppProvider>
    </MemoryRouter>
  )
}

describe('accessibility (axe-core, WCAG 2.x A/AA)', () => {
  it.each(PAGES)('%s (%s) has no violations', async (path) => {
    window.history.pushState({}, '', '/?skipintro')
    const { container } = render(<Shell path={path} />)
    await waitFor(() => expect(container.querySelector('main')?.children.length).toBeGreaterThan(0))
    const results = await axe.run(container, {
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    })
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
    expect(summary).toEqual([])
  })
})
