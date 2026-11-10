import type { AppData } from '../types'

const item = (id: string, productName: string, sku: string, q: number, p: number) => ({
  itemId: id,
  productName,
  sku,
  orderedQuantity: q,
  unitPrice: p,
})

export const sampleData: AppData = {
  users: [
    { userId: 'u1', name: 'Anita Rao', role: 'procurement_officer' },
    { userId: 'u2', name: 'Rahul Mehta', role: 'procurement_manager' },
    { userId: 'u3', name: 'Priya Nair', role: 'quality_inspector' },
    { userId: 'u4', name: 'Karthik Iyer', role: 'warehouse_receiver' },
    { userId: 'u5', name: 'Sunil Verma (Apex)', role: 'vendor', vendorId: 'v1' },
    { userId: 'u6', name: 'Meera Shah (Bright)', role: 'vendor', vendorId: 'v2' },
    { userId: 'u7', name: 'Dev Patel (Coastal)', role: 'vendor', vendorId: 'v3' },
  ],
  vendors: [
    { vendorId: 'v1', name: 'Apex Components Ltd', email: 'sales@apexcomp.example', contact: '+91 98100 11111', status: 'Active' },
    { vendorId: 'v2', name: 'Brightline Packaging', email: 'orders@brightline.example', contact: '+91 98100 22222', status: 'Active' },
    { vendorId: 'v3', name: 'Coastal Textiles', email: 'hello@coastaltex.example', contact: '+91 98100 33333', status: 'Active' },
    { vendorId: 'v4', name: 'Delta Fasteners', email: 'info@deltafast.example', contact: '+91 98100 44444', status: 'Inactive' },
  ],
  orders: [
    { orderId: 'PO-2026-001', vendorId: 'v1', status: 'Received', expectedDeliveryDate: '2026-10-20', createdAt: '2026-10-01', items: [item('i1', 'Control Board', 'CB-100', 200, 450), item('i2', 'Power Connector', 'PC-210', 500, 35)] },
    { orderId: 'PO-2026-002', vendorId: 'v2', status: 'Partially Received', expectedDeliveryDate: '2026-11-05', createdAt: '2026-10-10', items: [item('i3', 'Shipping Carton L', 'SC-L', 1000, 28), item('i4', 'Bubble Wrap Roll', 'BW-50', 120, 210)] },
    { orderId: 'PO-2026-003', vendorId: 'v3', status: 'Ordered', expectedDeliveryDate: '2026-11-02', createdAt: '2026-10-14', items: [item('i5', 'Cotton Fabric (m)', 'CF-01', 2500, 120)] },
    { orderId: 'PO-2026-004', vendorId: 'v1', status: 'Pending Approval', expectedDeliveryDate: '2026-11-28', createdAt: '2026-11-04', items: [item('i6', 'Sensor Module', 'SM-77', 300, 820)] },
    { orderId: 'PO-2026-005', vendorId: 'v2', status: 'Draft', expectedDeliveryDate: '2026-12-10', createdAt: '2026-11-09', items: [item('i7', 'Label Roll', 'LR-12', 400, 65)] },
    { orderId: 'PO-2026-006', vendorId: 'v3', status: 'Approved', expectedDeliveryDate: '2026-11-25', createdAt: '2026-11-06', items: [item('i8', 'Denim Fabric (m)', 'DF-09', 1500, 180)] },
    { orderId: 'PO-2026-007', vendorId: 'v1', status: 'Cancelled', expectedDeliveryDate: '2026-11-15', createdAt: '2026-10-25', items: [item('i9', 'Heat Sink', 'HS-3', 150, 95)] },
    { orderId: 'PO-2026-008', vendorId: 'v2', status: 'Partially Received', expectedDeliveryDate: '2026-11-18', createdAt: '2026-10-28', items: [item('i10', 'Corrugated Sheet', 'CS-5', 800, 42)] },
  ],
  receipts: [
    { receiptId: 'r1', orderId: 'PO-2026-001', receivedAt: '2026-10-19', notes: 'Complete delivery', receivedItems: [{ itemId: 'i1', receivedQuantity: 200 }, { itemId: 'i2', receivedQuantity: 500 }] },
    { receiptId: 'r2', orderId: 'PO-2026-002', receivedAt: '2026-11-06', notes: 'First batch, rest pending', receivedItems: [{ itemId: 'i3', receivedQuantity: 600 }, { itemId: 'i4', receivedQuantity: 120 }] },
    { receiptId: 'r3', orderId: 'PO-2026-008', receivedAt: '2026-11-10', notes: 'Half shipment arrived', receivedItems: [{ itemId: 'i10', receivedQuantity: 400 }] },
  ],
  inspections: [
    { inspectionId: 'q1', orderId: 'PO-2026-001', inspectedQuantity: 700, acceptedQuantity: 690, rejectedQuantity: 10, outcome: 'Passed', notes: 'Minor connector bends', inspectedAt: '2026-10-20', defects: [{ defectId: 'd1', inspectionId: 'q1', category: 'Dimensional', quantity: 10, description: 'Bent pins on connectors' }] },
    { inspectionId: 'q2', orderId: 'PO-2026-002', inspectedQuantity: 720, acceptedQuantity: 540, rejectedQuantity: 180, outcome: 'Failed', notes: 'Cartons crushed in transit', inspectedAt: '2026-11-07', defects: [{ defectId: 'd2', inspectionId: 'q2', category: 'Damage', quantity: 180, description: 'Crushed corners' }] },
    { inspectionId: 'q3', orderId: 'PO-2026-008', inspectedQuantity: 400, acceptedQuantity: 0, rejectedQuantity: 0, outcome: 'Pending Inspection', notes: '', inspectedAt: '2026-11-10', defects: [] },
  ],
  approvals: [
    { approvalId: 'a1', inspectionId: 'q1', decision: 'Approved', approverId: 'u1', comments: 'Within tolerance', decidedAt: '2026-10-21' },
  ],
  history: [
    { historyId: 'h1', orderId: 'PO-2026-001', previousStatus: null, newStatus: 'Draft', changedBy: 'u1', changedAt: '2026-10-01' },
    { historyId: 'h2', orderId: 'PO-2026-001', previousStatus: 'Draft', newStatus: 'Ordered', changedBy: 'u1', changedAt: '2026-10-03' },
    { historyId: 'h3', orderId: 'PO-2026-001', previousStatus: 'Ordered', newStatus: 'Received', changedBy: 'u4', changedAt: '2026-10-19' },
    { historyId: 'h4', orderId: 'PO-2026-002', previousStatus: null, newStatus: 'Draft', changedBy: 'u1', changedAt: '2026-10-10' },
    { historyId: 'h5', orderId: 'PO-2026-002', previousStatus: 'Draft', newStatus: 'Partially Received', changedBy: 'u4', changedAt: '2026-11-06' },
    { historyId: 'h6', orderId: 'PO-2026-004', previousStatus: null, newStatus: 'Pending Approval', changedBy: 'u1', changedAt: '2026-11-04' },
    { historyId: 'h7', orderId: 'PO-2026-007', previousStatus: null, newStatus: 'Cancelled', changedBy: 'u1', changedAt: '2026-10-26' },
  ],
}
