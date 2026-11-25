import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { createStore } from '../src/store.js'

const item = { itemId: 'i1', productName: 'Board', sku: 'B-1', orderedQuantity: 10, unitPrice: 5 }
const seed = () => ({
  users: [
    { userId: 'u1', name: 'Officer', role: 'procurement_officer' },
    { userId: 'u2', name: 'Manager', role: 'procurement_manager' },
    { userId: 'u3', name: 'Inspector', role: 'quality_inspector' },
    { userId: 'u4', name: 'Receiver', role: 'warehouse_receiver' },
    { userId: 'u5', name: 'Vendor A', role: 'vendor', vendorId: 'v1' },
  ],
  vendors: [{ vendorId: 'v1', name: 'A', email: 'a@x.test', contact: '1', status: 'Active' }, { vendorId: 'v2', name: 'B', email: 'b@x.test', contact: '2', status: 'Active' }],
  orders: [
    { orderId: 'PO-1', vendorId: 'v1', status: 'Draft', expectedDeliveryDate: '2026-12-01', createdAt: '2026-11-01', items: [item] },
    { orderId: 'PO-2', vendorId: 'v2', status: 'Ordered', expectedDeliveryDate: '2026-12-01', createdAt: '2026-11-01', items: [item] },
    { orderId: 'PO-3', vendorId: 'v1', status: 'Cancelled', expectedDeliveryDate: '2026-12-01', createdAt: '2026-11-01', items: [item] },
  ],
  receipts: [],
  inspections: [],
  approvals: [],
  history: [],
  audit: [],
})

let server
let base
before(async () => {
  const store = createStore(null)
  const app = createApp(store)
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })
  base = `http://localhost:${server.address().port}`
})
after(() => server.close())

const call = (method, path, user, body) =>
  fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(user ? { 'x-user-id': user } : {}) }, body: body ? JSON.stringify(body) : undefined })

const get = async (user) => (await call('GET', '/api/data', user)).json()

test('data is unavailable until seeded, then seeding works once', async () => {
  assert.equal((await call('GET', '/api/data', 'u1')).status, 409)
  assert.equal((await call('POST', '/api/seed', null, seed())).status, 201)
  assert.equal((await call('POST', '/api/seed', null, seed())).status, 409)
  assert.equal((await call('POST', '/api/seed', null, { nope: true })).status, 409)
})

test('requests without a known user are rejected', async () => {
  assert.equal((await call('GET', '/api/data', null)).status, 401)
  assert.equal((await call('GET', '/api/data', 'ghost')).status, 401)
})

test('vendors only see their own orders', async () => {
  const doc = await get('u5')
  assert.deepEqual(doc.orders.map((o) => o.orderId).sort(), ['PO-1', 'PO-3'])
  assert.equal((await call('GET', '/api/orders/PO-2', 'u5')).status, 404)
  assert.equal((await call('GET', '/api/audit', 'u5')).status, 403)
})

test('vendor can change the delivery date of their own order only', async () => {
  const doc = await get('u5')
  doc.orders = doc.orders.map((o) => (o.orderId === 'PO-1' ? { ...o, expectedDeliveryDate: '2026-12-20' } : o))
  assert.equal((await call('PUT', '/api/data', 'u5', doc)).status, 200)
  const again = await get('u1')
  assert.equal(again.orders.find((o) => o.orderId === 'PO-1').expectedDeliveryDate, '2026-12-20')

  const bad = await get('u5')
  bad.orders = bad.orders.map((o) => (o.orderId === 'PO-1' ? { ...o, status: 'Approved' } : o))
  const res = await call('PUT', '/api/data', 'u5', bad)
  assert.equal(res.status, 403)
})

test('invalid status transitions are blocked', async () => {
  const doc = await get('u1')
  doc.orders = doc.orders.map((o) => (o.orderId === 'PO-1' ? { ...o, status: 'Received' } : o))
  const res = await call('PUT', '/api/data', 'u1', doc)
  assert.equal(res.status, 403)
  assert.match((await res.json()).error, /Cannot change/)
})

test('cancelled orders accept no further updates', async () => {
  const doc = await get('u1')
  doc.orders = doc.orders.map((o) => (o.orderId === 'PO-3' ? { ...o, expectedDeliveryDate: '2027-01-01' } : o))
  const res = await call('PUT', '/api/data', 'u1', doc)
  assert.equal(res.status, 403)
  assert.match((await res.json()).error, /cancelled/)
})

test('only the officer creates orders, and an order needs a valid item', async () => {
  const neworder = { orderId: 'PO-9', vendorId: 'v1', status: 'Draft', expectedDeliveryDate: '2026-12-01', createdAt: '2026-11-02', items: [item] }
  const doc = await get('u4')
  assert.equal((await call('PUT', '/api/data', 'u4', { ...doc, orders: [...doc.orders, neworder] })).status, 403)

  const officer = await get('u1')
  const noItems = { ...neworder, items: [] }
  assert.equal((await call('PUT', '/api/data', 'u1', { ...officer, orders: [...officer.orders, noItems] })).status, 403)
  const badQty = { ...neworder, items: [{ ...item, orderedQuantity: 0 }] }
  assert.equal((await call('PUT', '/api/data', 'u1', { ...officer, orders: [...officer.orders, badQty] })).status, 403)
  assert.equal((await call('PUT', '/api/data', 'u1', { ...officer, orders: [...officer.orders, neworder] })).status, 200)
})

test('only authorised roles can record a decision, and the log is append-only', async () => {
  const doc = await get('u1')
  const inspection = { inspectionId: 'in1', orderId: 'PO-2', inspectedQuantity: 10, acceptedQuantity: 6, rejectedQuantity: 3, outcome: 'Failed', notes: '', defects: [], inspectedAt: '2026-11-03' }
  // accepted + rejected != inspected is refused (rule 4)
  assert.equal((await call('PUT', '/api/data', 'u3', { ...doc, inspections: [inspection] })).status, 403)
  const ok = { ...inspection, acceptedQuantity: 7 }
  assert.equal((await call('PUT', '/api/data', 'u3', { ...doc, inspections: [ok] })).status, 200)

  const withApproval = { ...(await get('u1')), approvals: [{ approvalId: 'a1', inspectionId: 'in1', decision: 'Rejected', approverId: 'u3', comments: 'x', decidedAt: '2026-11-04' }] }
  assert.equal((await call('PUT', '/api/data', 'u3', withApproval)).status, 403) // inspector cannot decide (rule 5)
  const asOfficer = { ...withApproval, approvals: [{ ...withApproval.approvals[0], approverId: 'u1' }] }
  assert.equal((await call('PUT', '/api/data', 'u1', asOfficer)).status, 200)
  const removed = { ...asOfficer, approvals: [] }
  assert.equal((await call('PUT', '/api/data', 'u1', removed)).status, 403)
})

test('receipts need the receiver role and cannot target cancelled orders', async () => {
  const doc = await get('u1')
  const receipt = (orderId) => ({ receiptId: `r-${orderId}`, orderId, receivedAt: '2026-11-05', notes: '', receivedItems: [{ itemId: 'i1', receivedQuantity: 5 }] })
  assert.equal((await call('PUT', '/api/data', 'u3', { ...doc, receipts: [receipt('PO-2')] })).status, 403)
  assert.equal((await call('PUT', '/api/data', 'u4', { ...doc, receipts: [receipt('PO-3')] })).status, 403)
  assert.equal((await call('PUT', '/api/data', 'u4', { ...doc, receipts: [receipt('PO-2')] })).status, 200)
})
