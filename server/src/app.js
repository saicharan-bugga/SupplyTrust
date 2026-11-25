import express from 'express'
import cors from 'cors'
import { validateChange, can } from './rules.js'

const COLLECTIONS = ['users', 'vendors', 'orders', 'receipts', 'inspections', 'approvals', 'history', 'audit']
const isDoc = (d) => d && typeof d === 'object' && COLLECTIONS.every((c) => Array.isArray(d[c]))

export function createApp(store) {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '5mb' }))

  // Demo identity: the client sends the selected demo user in x-user-id (the PRD uses role selection instead of real login).
  const auth = (req, res, next) => {
    const doc = store.get()
    if (!doc) return res.status(409).json({ error: 'Server has no data yet. POST /api/seed first.' })
    const user = doc.users.find((u) => u.userId === req.header('x-user-id'))
    if (!user) return res.status(401).json({ error: 'Unknown or missing x-user-id header' })
    req.user = user
    req.doc = doc
    next()
  }

  // Vendors only ever see their own orders and what hangs off them.
  const scope = (doc, user) => {
    if (user.role !== 'vendor') return doc
    const ids = new Set(doc.orders.filter((o) => o.vendorId === user.vendorId).map((o) => o.orderId))
    const insp = doc.inspections.filter((i) => ids.has(i.orderId))
    const inspIds = new Set(insp.map((i) => i.inspectionId))
    return {
      ...doc,
      orders: doc.orders.filter((o) => ids.has(o.orderId)),
      receipts: doc.receipts.filter((r) => ids.has(r.orderId)),
      inspections: insp,
      approvals: doc.approvals.filter((a) => inspIds.has(a.inspectionId)),
      history: doc.history.filter((h) => ids.has(h.orderId)),
      audit: [],
    }
  }

  app.get('/api/health', (_req, res) => res.json({ ok: true, seeded: Boolean(store.get()) }))

  // One-time seeding with the sample dataset (rejected once data exists).
  app.post('/api/seed', (req, res) => {
    if (store.get()) return res.status(409).json({ error: 'Already seeded' })
    if (!isDoc(req.body)) return res.status(400).json({ error: 'Body must be a full SupplyTrust data document' })
    store.set(req.body)
    res.status(201).json({ ok: true })
  })

  app.get('/api/data', auth, (req, res) => res.json(scope(req.doc, req.user)))

  // Replace the document. Vendors send a scoped view, so their change is merged into the full document first.
  app.put('/api/data', auth, (req, res) => {
    if (!isDoc(req.body)) return res.status(400).json({ error: 'Body must be a full SupplyTrust data document' })
    let next = req.body
    if (req.user.role === 'vendor') {
      const mine = new Set(req.doc.orders.filter((o) => o.vendorId === req.user.vendorId).map((o) => o.orderId))
      next = {
        ...req.doc,
        users: next.users,
        orders: req.doc.orders.map((o) => (mine.has(o.orderId) ? (next.orders.find((x) => x.orderId === o.orderId) ?? o) : o)),
        history: [...req.doc.history, ...next.history.filter((h) => !req.doc.history.some((e) => e.historyId === h.historyId))],
        audit: [...req.doc.audit, ...next.audit.filter((a) => !req.doc.audit.some((e) => e.auditId === a.auditId))],
      }
    }
    const errors = validateChange(req.doc, next, req.user)
    if (errors.length) return res.status(403).json({ error: errors[0], errors })
    store.set(next)
    res.json(scope(next, req.user))
  })

  // REST-style read views over the same document.
  for (const name of ['orders', 'vendors', 'receipts', 'inspections', 'approvals']) {
    app.get(`/api/${name}`, auth, (req, res) => res.json(scope(req.doc, req.user)[name]))
  }
  app.get('/api/audit', auth, (req, res) =>
    can(req.user.role, 'audit.view') ? res.json(req.doc.audit) : res.status(403).json({ error: 'Your role cannot view the audit log' }),
  )
  app.get('/api/orders/:id', auth, (req, res) => {
    const o = scope(req.doc, req.user).orders.find((x) => x.orderId === req.params.id)
    return o ? res.json(o) : res.status(404).json({ error: 'Order not found' })
  })

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
  return app
}
