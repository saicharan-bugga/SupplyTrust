import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SettingsPage } from './pages/SettingsPage'
import { AppProvider } from './state/AppContext'

export default function App() {
  return (
    <AppProvider>
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
