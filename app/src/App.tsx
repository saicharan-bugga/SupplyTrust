import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { SplashScreen } from './components/SplashScreen'
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage').then((m) => ({ default: m.ApprovalsPage })))
const AuditPage = lazy(() => import('./pages/AuditPage').then((m) => ({ default: m.AuditPage })))
import { DashboardPage } from './pages/DashboardPage'
const InspectionDetailPage = lazy(() => import('./pages/InspectionDetailPage').then((m) => ({ default: m.InspectionDetailPage })))
const InspectionsPage = lazy(() => import('./pages/InspectionsPage').then((m) => ({ default: m.InspectionsPage })))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const OrderFormPage = lazy(() => import('./pages/OrderFormPage').then((m) => ({ default: m.OrderFormPage })))
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
import { PlaceholderPage } from './pages/PlaceholderPage'
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const ReceiptsPage = lazy(() => import('./pages/ReceiptsPage').then((m) => ({ default: m.ReceiptsPage })))
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const VendorPortalPage = lazy(() => import('./pages/VendorPortalPage').then((m) => ({ default: m.VendorPortalPage })))
const VendorsPage = lazy(() => import('./pages/VendorsPage').then((m) => ({ default: m.VendorsPage })))
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
        <Suspense fallback={<p role="status" className="p-8 text-sm text-slate-600">Loading…</p>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="orders/:orderId/edit" element={<OrderFormPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="vendor-portal" element={<VendorPortalPage />} />
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
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
