import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProfilePage } from '../pages/ProfilePage'
import { AppProvider } from '../state/AppContext'

const renderProfile = (userId: string) => {
  localStorage.clear()
  localStorage.setItem('supplytrust.user.v1', JSON.stringify(userId))
  window.history.pushState({}, '', '/?skipintro')
  return render(
    <MemoryRouter>
      <AppProvider>
        <ProfilePage />
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => localStorage.clear())

  it('shows basic details and the role permissions', () => {
    renderProfile('u1')
    expect(screen.getAllByText('Anita Rao').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Procurement Officer').length).toBeGreaterThan(0)
    expect(screen.getByText('Create purchase orders')).toBeInTheDocument()
    expect(screen.queryByText('Record goods receipts')).not.toBeInTheDocument()
  })

  it('shows the vendor company for vendor users only', () => {
    renderProfile('u5')
    expect(screen.getByText('Apex Components Ltd')).toBeInTheDocument()
    expect(screen.getByText('Update delivery dates on own orders')).toBeInTheDocument()
  })

  it('validates and saves an edited display name', async () => {
    renderProfile('u1')
    await userEvent.click(screen.getByRole('button', { name: /edit name/i }))
    await userEvent.clear(screen.getByLabelText('Display name'))
    await userEvent.type(screen.getByLabelText('Display name'), 'A')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText(/at least 2 characters/)).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Display name'))
    await userEvent.type(screen.getByLabelText('Display name'), 'Anita R. Rao')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getAllByText('Anita R. Rao').length).toBeGreaterThan(0)
  })
})
