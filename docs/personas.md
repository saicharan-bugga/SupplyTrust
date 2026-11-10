# Persona cards

Five demo roles drive the interface. Each card lists responsibilities, goals, frustrations, permissions and the information the person wants first on their dashboard. The permission matrix is implemented in [`app/src/lib/permissions.ts`](../app/src/lib/permissions.ts).

## Procurement Officer - "Anita Rao"
| | |
|---|---|
| **Responsibilities** | Create and manage purchase orders, choose vendors, make the final approve / reject / reinspect decision on inspections |
| **Goals** | See every vendor's orders in one place; spot late orders before the vendor has to be chased |
| **Frustrations** | Order data scattered across spreadsheets and email; unclear which deliveries are ready for approval |
| **Permissions** | Create, edit and cancel orders; manage vendors; decide on inspections; view reports |
| **Dashboard shows first** | Total orders, pending approvals, delayed orders, inspection failures |

## Vendor - "Sunil Verma (Apex Components)"
| | |
|---|---|
| **Responsibilities** | Fulfil assigned orders and keep the buyer informed of progress |
| **Goals** | Know exactly what is expected and by when; update status once instead of answering follow-up emails |
| **Frustrations** | Repeated "where is my order" requests; unclear delivery deadlines |
| **Permissions** | View **only** orders assigned to their vendor; update fulfilment status and estimated delivery date |
| **Dashboard shows first** | Their assigned orders, deadlines, current fulfilment status |

## Quality Inspector - "Priya Nair"
| | |
|---|---|
| **Responsibilities** | Inspect delivered goods and record quantities, defects and notes |
| **Goals** | Consistent, complete inspection records that cannot be questioned later |
| **Frustrations** | Free-text inspection notes; totals that do not add up |
| **Permissions** | Record inspections (accepted + rejected must equal inspected); cannot approve or reject outcomes |
| **Dashboard shows first** | Orders pending inspection, recent failures |

## Procurement Manager - "Rahul Mehta"
| | |
|---|---|
| **Responsibilities** | Oversee purchasing performance and handle exceptions |
| **Goals** | Spot delays and stuck approvals early; understand order value and vendor reliability |
| **Frustrations** | No single view of exceptions; metrics that do not match the underlying records |
| **Permissions** | View all orders, reports and status history; can decide on inspections |
| **Dashboard shows first** | Delayed orders, pending approvals, order value, rejection rates |

## Warehouse Receiver - "Karthik Iyer"
| | |
|---|---|
| **Responsibilities** | Record what physically arrived and flag discrepancies |
| **Goals** | Reconcile delivered quantities against ordered quantities quickly |
| **Frustrations** | Partial shipments that are hard to track; paper delivery notes |
| **Permissions** | Record goods receipts (no negative quantities, no over-receipt without an exception) |
| **Dashboard shows first** | Orders awaiting delivery, outstanding quantities |

## Permission matrix

| Action | Officer | Manager | Vendor | Inspector | Receiver |
|---|:-:|:-:|:-:|:-:|:-:|
| Create / edit / cancel order | Yes | - | - | - | - |
| Update fulfilment status | - | - | Own orders | - | - |
| Record goods receipt | - | - | - | - | Yes |
| Record inspection | - | - | - | Yes | - |
| Approve / reject / reinspect | Yes | Yes | - | - | - |
| Manage vendors | Yes | - | - | - | - |
| View reports | Yes | Yes | - | - | - |
