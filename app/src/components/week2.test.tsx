import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sampleData } from '../data/sample'
import { PurchaseOrderForm } from './PurchaseOrderForm'

describe('PurchaseOrderForm', () => {
  it('shows inline errors and does not submit when empty', async () => {
    const onSave = vi.fn()
    render(<PurchaseOrderForm vendors={sampleData.vendors} onSave={onSave} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save as draft' }))
    const alerts = (await screen.findAllByRole('alert')).map((a) => a.textContent)
    expect(alerts).toContain('Select a vendor')
    expect(screen.getByText('Product name is required')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits valid values and lists only active vendors', async () => {
    const onSave = vi.fn()
    render(<PurchaseOrderForm vendors={sampleData.vendors} onSave={onSave} onCancel={() => {}} />)
    expect(screen.queryByRole('option', { name: 'Delta Fasteners' })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Vendor'), 'v1')
    await userEvent.type(screen.getByLabelText('Expected delivery date'), '2026-12-01')
    await userEvent.type(screen.getByLabelText('Product name'), 'Widget')
    await userEvent.type(screen.getByLabelText('SKU'), 'W-1')
    await userEvent.click(screen.getByRole('button', { name: 'Submit for approval' }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(onSave.mock.calls[0][1]).toBe(true)
    expect(onSave.mock.calls[0][0].items[0]).toMatchObject({ productName: 'Widget', orderedQuantity: 1 })
  })

  it('adds and removes item rows', async () => {
    render(<PurchaseOrderForm vendors={sampleData.vendors} onSave={() => {}} onCancel={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /add item/i }))
    expect(screen.getAllByRole('group', { name: /^Item [0-9]/ })).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Remove item 2' }))
    expect(screen.getAllByRole('group', { name: /^Item [0-9]/ })).toHaveLength(1)
  })
})
