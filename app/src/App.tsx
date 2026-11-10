import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SplashScreen } from './components/SplashScreen'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SettingsPage } from './pages/SettingsPage'
import { AppProvider } from './state/AppContext'

const SPLASH_KEY = 'supplytrust.splash.seen'

function splashAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !splashAlreadySeen())

  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1')
    } catch {
      /* storage unavailable */
    }
    setShowSplash(false)
  }, [])

  return (
    <AppProvider>
      {showSplash && <SplashScreen onDone={finishSplash} />}
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<PlaceholderPage title="Order details" week={2} />} />
            <Route path="vendors" element={<PlaceholderPage title="Vendors" week={2} />} />
            <Route path="receipts" element={<PlaceholderPage title="Goods receipt" week={3} />} />
            <Route path="inspections" element={<PlaceholderPage title="Quality inspection" week={3} />} />
            <Route path="approvals" element={<PlaceholderPage title="Approval queue" week={3} />} />
            <Route path="reports" element={<PlaceholderPage title="Reports & analytics" week={4} />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<PlaceholderPage title="Page not found" week={1} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
