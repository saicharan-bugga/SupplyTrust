import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleData } from '../data/sample'
import { ConfirmDialog } from './ConfirmDialog'
import { DashboardCard } from './DashboardCard'
import { NotificationToast } from './NotificationToast'
import { OrderTimeline } from './OrderTimeline'
import { PurchaseOrderTable } from './PurchaseOrderTable'
import { SearchFilterBar } from './SearchFilterBar'
import { VendorSelector } from './VendorSelector'

describe('DashboardCard', () => {
  it('shows title, value and hint', () => {
    render(<DashboardCard title="Delayed orders" value={3} hint="needs attention" />)
    expect(screen.getByText('Delayed orders')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('needs attention')).toBeInTheDocument()
  })
})

describe('VendorSelector', () => {
  it('offers only active vendors and reports changes', () => {
    const onChange = vi.fn()
    render(<VendorSelector vendors={sampleData.vendors} value="" onChange={onChange} />)
    expect(screen.queryByRole('option', { name: 'Delta Fasteners' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Vendor'), { target: { value: 'v1' } })
    expect(onChange).toHaveBeenCalledWith('v1')
  })

  it('shows an accessible error', () => {
    render(<VendorSelector vendors={sampleData.vendors} value="" onChange={() => {}} error="Select a vendor" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Select a vendor')
  })
})

describe('SearchFilterBar', () => {
  it('emits query and status changes', () => {
    const onQ = vi.fn()
    const onS = vi.fn()
    render(<SearchFilterBar query="" status="All" onQueryChange={onQ} onStatusChange={onS} />)
    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'apex' } })
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Draft' } })
    expect(onQ).toHaveBeenCalledWith('apex')
    expect(onS).toHaveBeenCalledWith('Draft')
  })
})

describe('PurchaseOrderTable', () => {
  it('renders orders and sorts on header click', () => {
    const onSort = vi.fn()
    render(
      <MemoryRouter>
        <PurchaseOrderTable
          orders={sampleData.orders.slice(0, 2)}
          vendors={sampleData.vendors}
          sort={{ key: 'orderId', dir: 'asc' }}
          onSortChange={onSort}
        />
      </MemoryRouter>,
    )
    expect(screen.getAllByText('PO-2026-001').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: /Value/ }))
    expect(onSort).toHaveBeenCalledWith('total')
  })
})

describe('OrderTimeline', () => {
  it('lists transitions oldest first', () => {
    const history = sampleData.history.filter((h) => h.orderId === 'PO-2026-001')
    render(<OrderTimeline history={[...history].reverse()} users={sampleData.users} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Draft')
    expect(items[2]).toHaveTextContent('Received')
  })

  it('shows an empty state', () => {
    render(<OrderTimeline history={[]} users={[]} />)
    expect(screen.getByText(/No status changes/)).toBeInTheDocument()
  })
})

describe('NotificationToast', () => {
  it('uses an alert role for errors and can be dismissed', () => {
    const onDismiss = vi.fn()
    render(<NotificationToast message="Could not save" severity="error" onDismiss={onDismiss} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(onDismiss).toHaveBeenCalled()
  })
})

describe('ConfirmDialog', () => {
  it('calls confirm and cancel handlers', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Cancel order?" message="This cannot be undone." confirmLabel="Cancel order" destructive onConfirm={onConfirm} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel order', { selector: 'button' }))
    fireEvent.click(screen.getByText('Cancel', { selector: 'button' }))
    expect(onConfirm).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })
})
