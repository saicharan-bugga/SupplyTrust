import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { MyDashboardPage } from '../pages/MyDashboardPage'
import { AppProvider } from '../state/AppContext'

const renderPage = (userId: string) => {
  localStorage.clear()
  localStorage.setItem('supplytrust.user.v1', JSON.stringify(userId))
  window.history.pushState({}, '', '/?skipintro')
  return render(
    <MemoryRouter>
      <AppProvider>
        <MyDashboardPage />
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('MyDashboardPage', () => {
  beforeEach(() => localStorage.clear())

  it('greets the signed-in user and shows their role', () => {
    renderPage('u1')
    expect(screen.getByText(/welcome back, anita/i)).toBeInTheDocument()
    expect(screen.getAllByText('Procurement Officer').length).toBeGreaterThan(0)
  })

  it('shows personal numbers and the recent-activity section', () => {
    renderPage('u1')
    expect(screen.getByLabelText('My numbers')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /my recent activity/i })).toBeInTheDocument()
  })

  it('shows only a vendor their own orders count', () => {
    renderPage('u5')
    expect(screen.getByLabelText('Orders I can see')).toHaveTextContent(/\d/)
  })
})
