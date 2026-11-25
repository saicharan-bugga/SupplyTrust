import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT, loadLayout, moveWidget, normalizeLayout, saveLayout, toggleWidget, visibleWidgets } from '../lib/dashboardLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { AppProvider } from '../state/AppContext'

describe('dashboard layout helpers', () => {
  it('moves a widget and ignores moves past the ends', () => {
    const moved = moveWidget(DEFAULT_LAYOUT, 'kpis', -1)
    expect(moved.order.slice(0, 2)).toEqual(['kpis', 'tasks'])
    expect(moveWidget(DEFAULT_LAYOUT, 'tasks', -1)).toBe(DEFAULT_LAYOUT)
  })

  it('hides and shows widgets', () => {
    const hidden = toggleWidget(DEFAULT_LAYOUT, 'spend')
    expect(visibleWidgets(hidden)).not.toContain('spend')
    expect(visibleWidgets(toggleWidget(hidden, 'spend'))).toContain('spend')
  })

  it('repairs saved data: drops unknown ids, keeps new widgets', () => {
    const fixed = normalizeLayout({ order: ['activity', 'bogus', 'tasks'], hidden: ['nope', 'kpis'] })
    expect(fixed.order.slice(0, 2)).toEqual(['activity', 'tasks'])
    expect(fixed.order).toHaveLength(DEFAULT_LAYOUT.order.length)
    expect(fixed.hidden).toEqual(['kpis'])
    expect(normalizeLayout('garbage')).toEqual(DEFAULT_LAYOUT)
  })

  it('saves per user and falls back to the default for corrupt data', () => {
    localStorage.clear()
    saveLayout('u1', toggleWidget(DEFAULT_LAYOUT, 'pending'))
    expect(loadLayout('u1').hidden).toEqual(['pending'])
    expect(loadLayout('u2')).toEqual(DEFAULT_LAYOUT)
    localStorage.setItem('supplytrust.dashboard.v1.u3', '{bad json')
    expect(loadLayout('u3')).toEqual(DEFAULT_LAYOUT)
  })
})

const renderDashboard = (userId = 'u1') => {
  localStorage.setItem('supplytrust.user.v1', JSON.stringify(userId))
  window.history.pushState({}, '', '/?skipintro')
  return render(
    <MemoryRouter>
      <AppProvider>
        <DashboardPage />
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('DashboardPage customisation', () => {
  beforeEach(() => localStorage.clear())

  it('hides a widget, remembers it, and can reset', async () => {
    const { unmount } = renderDashboard()
    expect(screen.getByRole('heading', { name: 'Spend by vendor' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /customise/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Spend by vendor' }))
    expect(screen.queryByRole('heading', { name: 'Spend by vendor' })).not.toBeInTheDocument()
    unmount()

    renderDashboard()
    expect(screen.queryByRole('heading', { name: 'Spend by vendor' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /customise/i }))
    await userEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByRole('heading', { name: 'Spend by vendor' })).toBeInTheDocument()
  })

  it('reorders widgets with the move buttons', async () => {
    renderDashboard()
    await userEvent.click(screen.getByRole('button', { name: /customise/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Move Recent activity up' }))
    expect(loadLayout('u1').order.indexOf('activity')).toBe(DEFAULT_LAYOUT.order.indexOf('activity') - 1)
  })

  it('keeps each user layout separate and shows a message when everything is hidden', async () => {
    renderDashboard('u1')
    await userEvent.click(screen.getByRole('button', { name: /customise/i }))
    for (const cb of screen.getAllByRole('checkbox')) await userEvent.click(cb)
    expect(screen.getByText(/all widgets are hidden/i)).toBeInTheDocument()
    expect(loadLayout('u2')).toEqual(DEFAULT_LAYOUT)
  })
})
