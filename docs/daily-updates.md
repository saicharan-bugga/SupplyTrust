# SupplyTrust - Daily Updates (Weeks 1 and 2)

**Project:** SupplyTrust - multi-vendor purchase order and quality inspection approval system (`PST_PD_007`)
**Team:** Lingala Navadeep, Sai Charan Bugga | **Mentor / Reviewer:** Tanishka
**Duration:** 4-week OJT project (this log covers the first 2 weeks, 10 working days)

| Week | Focus | Status |
|---|---|---|
| Week 1 | Requirements, journeys, wireframes, repository, React + Vite setup, design system, routing, reusable components, dashboard shell, first purchase order screen | Complete |
| Week 2 | Purchase order create / edit / cancel, validated forms, vendor management, order details, vendor-specific views, LocalStorage persistence | Planned |

---

# Week 1 - Foundation (Complete)

## Day 1 - Requirements and problem definition

**Goal:** Understand the PRD fully and agree what "done" means for the four weeks.

**Work done**
- Read the full PRD: overview, problem statement, personas, user stories (US-01 to US-12), screen inventory, workflow rules, UI states, responsiveness, tech stack, milestones, evaluation and deliverables.
- Wrote down the problem: purchase orders, vendor updates and quality inspection records are scattered across spreadsheets and emails, so delayed orders and pending approvals are hard to see.
- Listed the 10 workflow rules and the 7 order statuses (Draft, Pending Approval, Approved, Ordered, Partially Received, Received, Cancelled) and the 4 inspection outcomes.
- Split scope into must-have (MVP, graded), good-to-have and out-of-scope.
- Agreed the four-week priority from the PRD: a complete purchase order to inspection-decision workflow before any PWA, animation or dashboard customisation.

**Output:** Agreed scope and priorities; README overview and scope sections.
**Blockers:** None.
**Next:** Personas and user journeys.

## Day 2 - Personas and user journeys

**Goal:** Describe who uses the product and how work flows between them.

**Work done**
- Created persona cards for the five roles: Procurement Officer, Vendor, Quality Inspector, Procurement Manager, Warehouse Receiver (needs, pain points, permissions).
- Drew user journey and workflow diagrams: create PO, vendor fulfilment update, goods receipt, inspection, approve / reject / reinspect.
- Documented the order status flow and the rule that reinspection preserves earlier records.

**Output:** `docs/personas.md`, `docs/user-journeys.md`.
**Blockers:** None.
**Next:** Wireframes for every screen in the screen inventory.

## Day 3 - Wireframes for all major screens

**Goal:** Design every screen before writing UI code.

**Work done**
- Produced 12 low-fidelity wireframes: Dashboard, Purchase Order List, Create Purchase Order, Purchase Order Details, Vendor Management, Vendor Portal, Goods Receipt, Quality Inspection, Approval Queue, Inspection Details, Reports and Analytics, Settings.
- Defined the UI states for each screen: loading, empty, success, error, no search results, invalid form, unauthorised action.
- Planned responsive behaviour: phone (cards, collapsible navigation), tablet (two-column), laptop (sidebar, grid, tables).

**Output:** `docs/wireframes.md` and 12 SVG wireframes in `docs/wireframes/`.
**Blockers:** None.
**Next:** Create the repository and project setup.

## Day 4 - Repository, project setup and design system

**Goal:** Working React + Vite + TypeScript project with a consistent design system.

**Work done**
- Created the GitHub repository with a documented folder structure (`app/`, `docs/`).
- Set up React 19 + Vite + TypeScript, Tailwind CSS 4, react-router-dom, lucide-react, React Hook Form, Zod, Chart.js, Vitest and React Testing Library.
- Defined the domain types (users, vendors, orders, items, receipts, inspections, defects, approvals, status history).
- Built the sample dataset: 4 vendors, 8 orders across every status, receipts, inspections (passed, failed, pending) and status history.
- Created the design system: deep teal and ink surfaces, gold accents, accessible status badges (icon plus text, never colour alone).
- Designed the SupplyTrust logo and an animated intro screen.

**Output:** Running app skeleton, typed data model, design tokens, brand identity.
**Blockers:** None.
**Next:** Routing, app shell and reusable components.

## Day 5 - Routing, components, dashboard and tests

**Goal:** Responsive dashboard shell and the first purchase order screen, with tests.

**Work done**
- Implemented routing and a role-aware app shell with a demo user switcher (no login needed for the prototype).
- Built the reusable component library with typed props: `AppLayout`, `DashboardCard`, `PurchaseOrderTable`, `OrderStatusBadge`, `SearchFilterBar`, `VendorSelector`, `OrderTimeline`, `ConfirmDialog`, `NotificationToast`.
- Built the dashboard (KPI cards, delayed orders, awaiting approval) and the purchase order list with search, status filter, sortable columns and pagination.
- Derived metrics (order value, delay days, outstanding quantity, rejection rate) calculated from records, not stored.
- LocalStorage persistence with a Reset sample data option; vendors only see their own orders.
- Wrote 28 tests (93.5% statement coverage of `src/components` and `src/lib`).
- Visual polish: premium dashboard (greeting, order pipeline, quality ring, spend by vendor, upcoming deliveries, activity timeline), collapsible icon sidebar, four random classic intro animations, CSV export on the orders page.
- Checked layouts at phone, tablet and laptop widths and fixed a phone layout overlap.
- Wrote the README with screenshots, roles, workflow, tech stack and setup steps.

**Output:** Week 1 milestone complete: responsive dashboard shell, design system, initial purchase order screen, tests and documentation.
**Blockers:** Sidebar overlapped content on phones; fixed by making the shell layout flex at all widths.
**Next:** Week 2 - purchase order create / edit / cancel.

---

# Week 2 - Purchase Order and Vendor Workflows (Planned)

> Planned days. Update the status and outcome of each day as it is completed.

## Day 6 - Create purchase order form

**Goal:** Validated purchase order creation (US-01).

**Planned work**
- Build the Create Purchase Order screen: vendor selector (active vendors only), dynamic item rows (product, SKU, quantity, unit price), expected delivery date and a live total.
- Add a Zod schema and React Hook Form validation: at least one item, positive integer quantities, non-negative prices, valid future delivery date, vendor required.
- Show errors beside each field, accessible to keyboard and screen-reader users.
- Show a success toast and an empty-state prompt to create the first order.

**Expected output:** Working create form with field-level validation.
**Next:** Save, edit and workflow rules.

## Day 7 - Save, edit and status rules

**Goal:** Persist orders and enforce valid status changes (US-01, rules 1, 2, 9).

**Planned work**
- Save new orders to LocalStorage with a generated order reference (for example `PO-2026-009`).
- Add edit for orders still in Draft or Pending Approval.
- Define allowed status transitions (for example Draft to Pending Approval to Approved to Ordered) and block invalid ones.
- Record every change in status history with actor, timestamp and previous / new status.
- Unit tests for the transition rules and the form schema.

**Expected output:** Orders can be created and edited, with enforced transitions and history.
**Next:** Order details and cancellation.

## Day 8 - Order details page and cancellation

**Goal:** Review a single order end to end (US-11).

**Planned work**
- Build the Purchase Order Details page: order information, item table, totals, delivery information and the status timeline (`OrderTimeline`).
- Add cancel with a confirmation dialog (`ConfirmDialog`); cancelled orders accept no further fulfilment updates (rule 8).
- Show delay information for overdue orders and an inspection summary when one exists.
- Link every order reference on the dashboard and list to this page.

**Expected output:** Order details route replaces the placeholder; cancellation works safely.
**Next:** Vendor management and vendor-specific views.

## Day 9 - Vendor management and vendor portal

**Goal:** Vendor workflows (US-04, US-05, US-06).

**Planned work**
- Build Vendor Management: list, add and edit vendors with validated contact details, active / inactive status and an empty-vendor-list state.
- Add vendor performance indicators (on-time deliveries, orders count, rejection rate) calculated from records.
- Vendor portal view: a signed-in vendor sees only their own orders and can update fulfilment status and estimated delivery date within allowed transitions.
- Tests confirming a vendor cannot see or change another vendor's orders.

**Expected output:** Vendor management screen and a restricted vendor view.
**Next:** Testing, responsiveness and documentation.

## Day 10 - Testing, responsive review and release of Week 2

**Goal:** Stable, documented Week 2 milestone.

**Planned work**
- Component and critical-path tests: create order, edit order, cancel order, vendor-only access, invalid transitions.
- Check every new screen at phone, tablet and laptop widths; keep key actions reachable on phones.
- Verify loading, empty, error and success states and keyboard accessibility of the forms.
- Update the README (features, screenshots, week status), run type-check, lint and tests, and push clean commits to GitHub.
- Prepare a short demo of the Week 2 workflow for the mentor review.

**Expected output:** Working purchase order and vendor management workflows, test results and updated documentation.
**Next:** Week 3 - goods receipt, quality inspection and approval workflow.

---

## Summary

| Day | Theme | Status |
|---|---|---|
| 1 | Requirements and problem definition | Done |
| 2 | Personas and user journeys | Done |
| 3 | Wireframes for all screens | Done |
| 4 | Repository, setup, design system, data model | Done |
| 5 | Routing, components, dashboard, tests, README | Done |
| 6 | Create purchase order form and validation | Planned |
| 7 | Persistence, edit, status transition rules | Planned |
| 8 | Order details page and cancellation | Planned |
| 9 | Vendor management and vendor portal | Planned |
| 10 | Testing, responsive review, documentation | Planned |
