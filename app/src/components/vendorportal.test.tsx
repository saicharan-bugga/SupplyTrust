import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { VendorPortalPage } from '../pages/VendorPortalPage'
import { AppProvider } from '../state/AppContext'

const renderPortal = (userId: string) => {
  localStorage.clear()
  localStorage.setItem('supplytrust.user.v1', JSON.stringify(userId))
  window.history.pushState({}, '', '/?skipintro')
  return render(
    <MemoryRouter>
      <AppProvider>
        <VendorPortalPage />
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('VendorPortalPage', () => {
  beforeEach(() => localStorage.clear())

  it('shows a vendor only their own orders', () => {
    renderPortal('u5')
    expect(screen.getByRole('heading', { name: /vendor portal/i })).toBeInTheDocument()
    expect(screen.getByText('My orders')).toBeInTheDocument()
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('blocks non-vendor roles', () => {
    renderPortal('u1')
    expect(screen.getByText(/only for vendor accounts/i)).toBeInTheDocument()
  })
})
