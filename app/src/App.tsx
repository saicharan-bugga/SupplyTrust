import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SplashScreen } from './components/SplashScreen'
import { DashboardPage } from './pages/DashboardPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { OrderFormPage } from './pages/OrderFormPage'
import { OrdersPage } from './pages/OrdersPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SettingsPage } from './pages/SettingsPage'
import { VendorsPage } from './pages/VendorsPage'
import { AppProvider, useApp } from './state/AppContext'

function Intro() {
  const { introVisible, endIntro } = useApp()
  return introVisible ? <SplashScreen onDone={endIntro} /> : null
}

export default function App() {
  return (
    <AppProvider>
      <Intro />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="orders/:orderId/edit" element={<OrderFormPage />} />
            <Route path="vendors" element={<VendorsPage />} />
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
