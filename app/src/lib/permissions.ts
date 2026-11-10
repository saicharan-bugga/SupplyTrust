import type { Role } from '../types'

export type Permission =
  | 'order.create'
  | 'order.edit'
  | 'order.cancel'
  | 'order.updateFulfillment'
  | 'receipt.record'
  | 'inspection.record'
  | 'inspection.decide'
  | 'vendor.manage'
  | 'reports.view'

const MATRIX: Record<Role, Permission[]> = {
  procurement_officer: ['order.create', 'order.edit', 'order.cancel', 'inspection.decide', 'vendor.manage', 'reports.view'],
  procurement_manager: ['reports.view', 'inspection.decide'],
  vendor: ['order.updateFulfillment'],
  quality_inspector: ['inspection.record'],
  warehouse_receiver: ['receipt.record'],
}

export const can = (role: Role, permission: Permission): boolean => MATRIX[role].includes(permission)

export interface NavItem {
  to: string
  label: string
  roles: Role[]
}

const ALL: Role[] = ['procurement_officer', 'procurement_manager', 'vendor', 'quality_inspector', 'warehouse_receiver']

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', roles: ALL },
  { to: '/orders', label: 'Purchase Orders', roles: ALL },
  { to: '/vendors', label: 'Vendors', roles: ['procurement_officer', 'procurement_manager'] },
  { to: '/receipts', label: 'Goods Receipt', roles: ['warehouse_receiver', 'procurement_officer'] },
  { to: '/inspections', label: 'Quality Inspection', roles: ['quality_inspector', 'procurement_officer', 'procurement_manager'] },
  { to: '/approvals', label: 'Approval Queue', roles: ['procurement_officer', 'procurement_manager'] },
  { to: '/reports', label: 'Reports & Analytics', roles: ['procurement_officer', 'procurement_manager'] },
  { to: '/settings', label: 'Settings', roles: ALL },
]
