export type Role =
  | 'procurement_officer'
  | 'vendor'
  | 'quality_inspector'
  | 'procurement_manager'
  | 'warehouse_receiver'

export const ROLE_LABELS: Record<Role, string> = {
  procurement_officer: 'Procurement Officer',
  vendor: 'Vendor',
  quality_inspector: 'Quality Inspector',
  procurement_manager: 'Procurement Manager',
  warehouse_receiver: 'Warehouse Receiver',
}

export type OrderStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Ordered'
  | 'Partially Received'
  | 'Received'
  | 'Cancelled'

export type InspectionOutcome =
  | 'Pending Inspection'
  | 'Passed'
  | 'Failed'
  | 'Reinspection Required'

export interface User {
  userId: string
  name: string
  role: Role
  vendorId?: string
}

export interface Vendor {
  vendorId: string
  name: string
  email: string
  contact: string
  status: 'Active' | 'Inactive'
}

export interface PurchaseOrderItem {
  itemId: string
  productName: string
  sku: string
  orderedQuantity: number
  unitPrice: number
}

export interface PurchaseOrder {
  orderId: string
  vendorId: string
  items: PurchaseOrderItem[]
  expectedDeliveryDate: string
  status: OrderStatus
  createdAt: string
}

export interface ReceivedItem {
  itemId: string
  receivedQuantity: number
}

export interface GoodsReceipt {
  receiptId: string
  orderId: string
  receivedItems: ReceivedItem[]
  receivedAt: string
  notes: string
}

export interface InspectionDefect {
  defectId: string
  inspectionId: string
  category: string
  quantity: number
  description: string
}

export interface QualityInspection {
  inspectionId: string
  orderId: string
  inspectedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  outcome: InspectionOutcome
  notes: string
  defects: InspectionDefect[]
  inspectedAt: string
}

export interface ApprovalRecord {
  approvalId: string
  inspectionId: string
  decision: 'Approved' | 'Rejected' | 'Reinspection Requested'
  approverId: string
  comments: string
  decidedAt: string
}

export interface StatusHistory {
  historyId: string
  orderId: string
  previousStatus: OrderStatus | null
  newStatus: OrderStatus
  changedBy: string
  changedAt: string
}

export interface AuditEntry {
  auditId: string
  orderId?: string
  actorId: string
  action: string
  detail: string
  at: string
}

export interface AppData {
  users: User[]
  vendors: Vendor[]
  orders: PurchaseOrder[]
  receipts: GoodsReceipt[]
  inspections: QualityInspection[]
  approvals: ApprovalRecord[]
  history: StatusHistory[]
  audit: AuditEntry[]
}
