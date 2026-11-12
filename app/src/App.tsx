import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SplashScreen } from './components/SplashScreen'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { AuditPage } from './pages/AuditPage'
import { DashboardPage } from './pages/DashboardPage'
import { InspectionDetailPage } from './pages/InspectionDetailPage'
import { InspectionsPage } from './pages/InspectionsPage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { OrderFormPage } from './pages/OrderFormPage'
import { OrdersPage } from './pages/OrdersPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReceiptsPage } from './pages/ReceiptsPage'
import { ReportsPage } from './pages/ReportsPage'
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
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="orders/:orderId/edit" element={<OrderFormPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="inspections/:inspectionId" element={<InspectionDetailPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<PlaceholderPage title="Page not found" week={1} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
