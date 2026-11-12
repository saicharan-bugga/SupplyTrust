import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleData } from '../data/sample'
import { AppProvider } from '../state/AppContext'
import { ApprovalPanel } from './ApprovalPanel'
import { CommandPalette } from './CommandPalette'
import { GoodsReceiptForm } from './GoodsReceiptForm'
import { InspectionForm } from './InspectionForm'
import { OrderPipeline } from './OrderPipeline'

const q2 = sampleData.inspections.find((i) => i.inspectionId === 'q2')!
const q3 = sampleData.inspections.find((i) => i.inspectionId === 'q3')!

describe('GoodsReceiptForm', () => {
  const order = sampleData.orders.find((o) => o.orderId === 'PO-2026-003')!
  it('blocks a quantity above the outstanding amount', async () => {
    const onSubmit = vi.fn()
    render(<GoodsReceiptForm data={sampleData} order={order} onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/Received quantity for Cotton/), '9999')
    await userEvent.click(screen.getByRole('button', { name: 'Record receipt' }))
    expect(await screen.findByText('Only 2500 still outstanding')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('submits valid quantities with notes', async () => {
    const onSubmit = vi.fn()
    render(<GoodsReceiptForm data={sampleData} order={order} onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/Received quantity for Cotton/), '1000')
    await userEvent.type(screen.getByLabelText(/Notes/), 'first lot')
    await userEvent.click(screen.getByRole('button', { name: 'Record receipt' }))
    expect(onSubmit).toHaveBeenCalledWith({ i5: 1000 }, 'first lot')
  })
})

describe('InspectionForm', () => {
  it('keeps accepted and rejected in sync and requires defects for rejected units', async () => {
    const onSubmit = vi.fn()
    render(<InspectionForm inspection={q3} onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.clear(screen.getByLabelText('Rejected units'))
    await userEvent.type(screen.getByLabelText('Rejected units'), '100')
    expect(screen.getByLabelText('Accepted units')).toHaveValue(300)
    await userEvent.click(screen.getByRole('button', { name: 'Save inspection' }))
    expect(await screen.findByText(/at least one defect/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('submits a clean inspection', async () => {
    const onSubmit = vi.fn()
    render(<InspectionForm inspection={q3} onSubmit={onSubmit} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save inspection' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ acceptedQuantity: 400, rejectedQuantity: 0 })
  })
})

describe('ApprovalPanel', () => {
  it('demands a comment before rejecting', async () => {
    const onDecide = vi.fn()
    render(<ApprovalPanel inspection={q2} onDecide={onDecide} />)
    await userEvent.click(screen.getByRole('button', { name: /^Reject/ }))
    expect(await screen.findByText(/at least 5 characters/)).toBeInTheDocument()
    expect(onDecide).not.toHaveBeenCalled()
  })
  it('warns that a failed inspection never accepts rejected units', () => {
    render(<ApprovalPanel inspection={q2} onDecide={() => {}} />)
    expect(screen.getByRole('note')).toHaveTextContent('180 rejected units are never accepted')
  })
  it('submits a reinspection request with its comment', async () => {
    const onDecide = vi.fn()
    render(<ApprovalPanel inspection={q2} onDecide={onDecide} />)
    await userEvent.type(screen.getByLabelText('Decision comments'), 'Recount the cartons')
    await userEvent.click(screen.getByRole('button', { name: /Request reinspection/ }))
    expect(onDecide).toHaveBeenCalledWith('Reinspection Requested', 'Recount the cartons')
  })
})

describe('OrderPipeline', () => {
  it('marks the current step and shows a cancelled notice', () => {
    const { rerender } = render(<OrderPipeline status="Approved" />)
    expect(screen.getByText('Approved').closest('li')).toHaveAttribute('aria-current', 'step')
    rerender(<OrderPipeline status="Cancelled" />)
    expect(screen.getByText(/was cancelled/)).toBeInTheDocument()
  })
})

describe('CommandPalette', () => {
  it('filters results as you type', async () => {
    window.history.pushState({}, '', '/?skipintro')
    render(
      <MemoryRouter>
        <AppProvider>
          <CommandPalette open onClose={() => {}} />
        </AppProvider>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByRole('combobox', { hidden: true }), { target: { value: 'PO-2026-004' } })
    const options = await screen.findAllByRole('option', { hidden: true })
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('PO-2026-004')
  })
})
