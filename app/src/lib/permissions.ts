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
  | 'audit.view'

const MATRIX: Record<Role, Permission[]> = {
  procurement_officer: ['order.create', 'order.edit', 'order.cancel', 'inspection.decide', 'vendor.manage', 'reports.view', 'audit.view'],
  procurement_manager: ['reports.view', 'inspection.decide', 'audit.view'],
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
  { to: '/audit', label: 'Audit Log', roles: ['procurement_officer', 'procurement_manager'] },
  { to: '/settings', label: 'Settings', roles: ALL },
]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'order.create': 'Create purchase orders',
  'order.edit': 'Edit draft and pending orders',
  'order.cancel': 'Cancel orders',
  'order.updateFulfillment': 'Update delivery dates on own orders',
  'receipt.record': 'Record goods receipts',
  'inspection.record': 'Record quality inspections',
  'inspection.decide': 'Approve, reject or request reinspection',
  'vendor.manage': 'Add and manage vendors',
  'reports.view': 'View reports and analytics',
  'audit.view': 'View the audit log',
}

export const permissionsFor = (role: Role): Permission[] => MATRIX[role]
