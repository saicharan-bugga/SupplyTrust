import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderStatusBadge } from './OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it('shows the status as text, not colour alone', () => {
    render(<OrderStatusBadge status="Pending Approval" />)
    expect(screen.getByText('Pending Approval')).toBeInTheDocument()
  })
})
