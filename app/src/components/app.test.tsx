import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { can, NAV_ITEMS } from '../lib/permissions'
import { DashboardPage } from '../pages/DashboardPage'
import { OrdersPage } from '../pages/OrdersPage'
import { AppProvider, useApp } from '../state/AppContext'
import { AppLayout } from './AppLayout'
import { ConfirmDialog } from './ConfirmDialog'
import { LogoMark, LogoWordmark } from './Logo'
import { ToastRegion } from './NotificationToast'
import { SplashScreen } from './SplashScreen'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/?skipintro')
})

function Shell({ path = '/' }: { path?: string }) {
  return (
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('permissions', () => {
  it('lets only authorised roles act', () => {
    expect(can('procurement_officer', 'order.create')).toBe(true)
    expect(can('vendor', 'order.create')).toBe(false)
    expect(can('quality_inspector', 'inspection.decide')).toBe(false)
    expect(can('procurement_manager', 'inspection.decide')).toBe(true)
    expect(can('warehouse_receiver', 'receipt.record')).toBe(true)
  })

  it('hides management screens from vendors', () => {
    const vendorNav = NAV_ITEMS.filter((n) => n.roles.includes('vendor')).map((n) => n.label)
    expect(vendorNav).not.toContain('Vendors')
    expect(vendorNav).not.toContain('Approval Queue')
  })
})

describe('Logo', () => {
  it('renders the mark and wordmark', () => {
    render(
      <>
        <LogoMark animated />
        <LogoWordmark />
      </>,
    )
    expect(screen.getByRole('img', { name: 'SupplyTrust logo' })).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
  })
})

describe('SplashScreen', () => {
  it('finishes by itself and can be skipped', () => {
    vi.useFakeTimers()
    const done = vi.fn()
    render(<SplashScreen onDone={done} />)
    fireEvent.click(screen.getByText('Skip'))
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(done).toHaveBeenCalled()
    vi.useRealTimers()
  })
})

describe('ConfirmDialog states', () => {
  it('opens and closes without throwing', () => {
    const { rerender } = render(<ConfirmDialog open={false} title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
    rerender(<ConfirmDialog open title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
    rerender(<ConfirmDialog open={false} title="T" message="M" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('T', { selector: 'h2' })).toBeInTheDocument()
  })
})

describe('AppLayout', () => {
  it('shows role-aware navigation and switches users', () => {
    render(<Shell />)
    expect(screen.getByRole('link', { name: 'Vendors' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'u5' } })
    expect(screen.queryByRole('link', { name: 'Vendors' })).not.toBeInTheDocument()
  })

  it('does not turn the sidebar logo into an intro replay button', () => {
    render(<Shell />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(screen.queryByRole('button', { name: /replay intro/i })).not.toBeInTheDocument()
  })

  it('opens and closes the mobile menu', () => {
    render(<Shell />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })
})

describe('Toast region', () => {
  function Trigger() {
    const { notify } = useApp()
    return <button onClick={() => notify('Saved', 'success')}>go</button>
  }
  it('shows and dismisses a notification', () => {
    render(
      <AppProvider>
        <Trigger />
        <ToastRegion />
      </AppProvider>,
    )
    fireEvent.click(screen.getByText('go'))
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('Dashboard and orders (critical path)', () => {
  it('shows dashboard metrics that match the sample records', () => {
    render(<Shell />)
    expect(screen.getByLabelText('Total orders')).toHaveTextContent('8')
    expect(screen.getByLabelText('Pending approvals')).toHaveTextContent('1')
    expect(screen.getAllByLabelText('Delayed orders')[0]).toHaveTextContent('2')
    expect(screen.getByLabelText('Inspection failures')).toHaveTextContent('1')
  })

  it('filters and searches the order list', () => {
    render(<Shell path="/orders" />)
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Cancelled' } })
    expect(screen.getAllByText('PO-2026-007').length).toBeGreaterThan(0)
    expect(screen.queryByText('PO-2026-001')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'zzz' } })
    expect(screen.getByText(/No records match/)).toBeInTheDocument()
  })

  it('shows a vendor only their own orders', () => {
    render(<Shell path="/orders" />)
    fireEvent.change(screen.getByRole('combobox', { name: /demo user/i }), { target: { value: 'u5' } })
    expect(screen.getAllByText('PO-2026-001').length).toBeGreaterThan(0)
    expect(screen.queryByText('PO-2026-003')).not.toBeInTheDocument()
  })
})
