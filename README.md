<div align="center">

<img src="docs/assets/logo.svg" alt="SupplyTrust logo" width="120" />

# SupplyTrust

### Order. Inspect. Approve.

**A multi-vendor purchase order and quality-inspection approval platform,**<br/>
**designed so procurement teams always know what is late, what failed and what needs a decision.**

<br/>

<img src="docs/screenshots/dashboard-laptop.png" alt="SupplyTrust dashboard" width="900" />

### [Open the live demo](https://saicharan-bugga.github.io/SupplyTrust/)

No login needed: pick a role from the top bar (Procurement Officer, Manager, Vendor, Quality Inspector, Warehouse Receiver). Press **Ctrl + K** to jump anywhere.

<br/>

![React](https://img.shields.io/badge/React-19-0f766e?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-0f766e?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-0f766e?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-0f766e?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-0f766e?style=for-the-badge&logo=vitest&logoColor=white)
![Status](https://img.shields.io/badge/Week_1-Complete-f59e0b?style=for-the-badge)

`PST_PD_007` &nbsp;|&nbsp; Batch 2026 &nbsp;|&nbsp; Level 3 (Stretch) &nbsp;|&nbsp; 4-week OJT project

[Overview](#overview) · [Highlights](#highlights) · [Screens](#screens) · [Features](#features) · [Roles](#roles-and-permissions) · [Workflow](#workflow) · [Tech stack](#tech-stack) · [Getting started](#getting-started) · [4-week plan](#4-week-plan) · [Evaluation](#evaluation) · [Team](#team)

</div>

---

## Highlights

| | |
|---|---|
| **Executive dashboard** | Welcome banner, KPI cards, order pipeline, quality ring, spend by vendor, upcoming deliveries, delayed and pending lists and a live activity timeline |
| **Cinematic, classic intro** | Four hand-built navy-and-gold intro sequences (curtains, seal, counter, spotlight); a different one every visit |
| **Collapsible icon rail** | A slim icon-only sidebar that expands to full labels with one tap, with live alert badges |
| **Role-aware by design** | Five personas, each with their own navigation and permissions; vendors only ever see their own orders |
| **Built to be trusted** | 86 automated tests, accessible status badges, keyboard shortcuts, reduced-motion support, responsive from phone to widescreen |

## Overview

Procurement officers often manage purchase orders, vendor communication, delivery updates and quality inspection records across spreadsheets, emails and disconnected systems. That makes it hard to find delayed orders, track inspection outcomes, or know which deliveries are ready for approval.

**SupplyTrust** puts all of it on one dashboard:

- Procurement officers create and manage purchase orders.
- Vendors update fulfilment progress on their own assigned orders.
- Warehouse receivers record what actually arrived.
- Quality inspectors document inspection results.
- Authorised users review the results and **approve, reject or request reinspection** before goods are accepted.

| | |
|---|---|
| **Industry** | Supply chain management |
| **Theme** | Supply chain purchase order workflow |
| **Product promise** | Create and track purchase orders, manage vendor updates and review quality inspection decisions from one dashboard |
| **Primary objective** | Improve visibility into purchase order status and reduce manual coordination between procurement teams and vendors |
| **Decision supported** | Should an order be created, tracked, inspected, approved, rejected or escalated? |

## Screens

<div align="center">

**Four classic intros, chosen at random on every visit**

| Curtains | Gold seal |
|---|---|
| <img src="docs/screenshots/intro-1.png" alt="Curtains intro" /> | <img src="docs/screenshots/intro-2.png" alt="Gold seal intro" /> |
| **Counter** | **Spotlight** |
| <img src="docs/screenshots/intro-3.png" alt="Counter intro" /> | <img src="docs/screenshots/intro-4.png" alt="Spotlight intro" /> |

</div>

### Laptop

| Dashboard | Purchase orders |
|---|---|
| <img src="docs/screenshots/dashboard-laptop.png" alt="Dashboard on a laptop" /> | <img src="docs/screenshots/orders-laptop.png" alt="Purchase order list on a laptop" /> |

### Week 2 screens

| Create order | Order details | Vendors |
|---|---|---|
| <img src="docs/screenshots/week2-create-order.png" alt="Create purchase order" /> | <img src="docs/screenshots/week2-order-details.png" alt="Order details with status history" /> | <img src="docs/screenshots/week2-vendors.png" alt="Vendor management" /> |

### Week 3 screens

| Approval queue | Reports and analytics | Dark theme |
|---|---|---|
| <img src="docs/screenshots/week3-approvals.png" alt="Approval queue" /> | <img src="docs/screenshots/week3-reports.png" alt="Reports and analytics" /> | <img src="docs/screenshots/week3-dark-dashboard.png" alt="Dark theme dashboard" /> |

| Order progress | Goods receipt | Inspection |
|---|---|---|
| <img src="docs/screenshots/week3-order-details.png" alt="Order details with progress tracker" /> | <img src="docs/screenshots/week3-receipts.png" alt="Goods receipt" /> | <img src="docs/screenshots/week3-inspection-details.png" alt="Inspection details" /> |

### Profile

<img src="docs/screenshots/profile.png" alt="Profile page" width="700" />

### Tablet and phone

| Tablet - dashboard | Phone - dashboard | Phone - orders |
|---|---|---|
| <img src="docs/screenshots/dashboard-tablet.png" alt="Dashboard on a tablet" width="300" /> | <img src="docs/screenshots/dashboard-phone.png" alt="Dashboard on a phone" width="220" /> | <img src="docs/screenshots/orders-phone.png" alt="Orders on a phone" width="220" /> |

The order list switches from a table to cards on small screens, the sidebar stays as a slim icon rail that expands over the page, and forms stay usable without horizontal scrolling.

Low-fidelity wireframes for all 12 screens are in [`docs/wireframes.md`](docs/wireframes.md).

## Features

**Built (Week 1)**
- Four randomised classic intro animations with skip and reduced-motion support
- Responsive app shell: collapsible icon-only sidebar (one-tap expand), live alert badges, frosted top bar, skip-to-content link, role-aware navigation
- Quick search (Ctrl + K) and a notification bell listing delayed and pending orders
- Demo user switcher (no login needed) with role-based menus
- Premium dashboard: personalised greeting, KPI cards, order pipeline, quality health ring, spend by vendor, upcoming deliveries, delayed and awaiting-approval lists, recent activity timeline
- Purchase order list with search, quick status chips, sortable columns, pagination and CSV export
- Status badges that use an icon and text, not colour alone
- Vendors see only their own orders
- Derived metrics (order value, delay, outstanding quantity, rejection rate) calculated from records
- LocalStorage persistence with a one-click reset to sample data
- Reusable components: `AppLayout`, `DashboardCard`, `PurchaseOrderTable`, `OrderStatusBadge`, `SearchFilterBar`, `VendorSelector`, `OrderTimeline`, `ConfirmDialog`, `NotificationToast`
- Unit and component tests

**Built (Week 2)**
- Create and edit purchase orders with a validated form (React Hook Form + Zod): multiple items, live total, inline errors, save as draft or submit for approval
- Order detail page: summary cards, itemised lines, status history timeline, inspection summary
- Enforced status workflow: invalid transitions are blocked, only permitted roles see each action, cancelling asks for confirmation, and every change records who, when, and the previous and new status
- Orders can be edited only while Draft or Pending Approval; cancelled and received orders are locked
- Vendor management: add, edit, activate or deactivate vendors with per-vendor order counts and value; inactive vendors cannot receive new orders

**Built (Week 3)**
- Goods receipt: record what arrived per item, checked against outstanding quantity; moves the order to Partially Received or Received and opens a pending inspection automatically
- Quality inspection: accepted and rejected units must equal inspected units, defects are categorised and must add up, outcome (Passed or Failed at 10% rejection) is computed
- Approval queue: approve, reject or request reinspection with mandatory comments and a confirmation on rejection; a failed inspection never auto-accepts the whole order; reinspection keeps the old record and opens a new one
- Inspection detail page with decision history and other inspections of the same order
- Role-specific "your work today" task cards, vendor delivery-date updates, visual order progress tracker
- Reports and analytics: charts (status, spend, defects), vendor performance scorecard, CSV export and print / PDF
- Audit log of every status change, receipt, inspection, decision and date update, searchable and exportable
- Command palette (Ctrl + K) to jump to any page, order or vendor; dark theme toggle
- Profile page (click your avatar): basic details, what your role can do, your recent activity, editable display name, theme and demo-user switch
- Unauthorised actions are blocked in both the UI and the logic layer

**Coming next**
- Charts, exports, notifications, audit log, optional backend (Stretch)

<details>
<summary><b>Full scope from the PRD</b></summary>

**Must have (MVP, graded)**
- Purchase order creation, viewing, editing and cancellation subject to workflow rules
- Multi-vendor management with vendor-specific order lists
- Items, quantities, unit prices, total order value and expected delivery dates
- Order status tracking: Draft, Pending Approval, Approved, Ordered, Partially Received, Received, Cancelled
- Quality inspection records with inspected, accepted and rejected quantities
- Inspection outcomes: Pending Inspection, Passed, Failed, Reinspection Required
- Approval and rejection workflow with comments and recorded decision details
- Role-based interface permissions for Procurement Officers, Vendors and Quality Inspectors
- Search, status filters and sorting for purchase orders
- Dashboard cards: total orders, pending approvals, delayed orders, inspection failures
- LocalStorage or JSON-file persistence for the initial demonstration
- Responsive interface for laptop and phone-width screens
- Form validation and clear success/error messages
- Sample vendors, purchase orders and inspection records
- Order detail page with status history and inspection summary

**Good to have**
- CSV or PDF export of purchase orders and inspection reports
- Vendor performance summary (on-time deliveries and inspection outcomes)
- Notifications for overdue deliveries and pending approvals
- Purchase order change history and audit log
- Dashboard charts: order status, vendor performance, quality rejection rates
- Pagination and advanced filtering
- REST API integration with persistent backend storage
- Dark / light theme toggle

**Out of scope**
- Real financial transactions, vendor payments or banking integrations
- Live ERP, accounting or warehouse-management integration
- Automatic procurement decisions without human approval
- Legally binding digital signatures or contract management
- Complex multi-organisation enterprise deployment
- Real-time IoT shipment or inventory tracking
- Production-grade identity management for the prototype

</details>

## Roles and permissions

Pick a demo user from the header dropdown to switch role. Full persona cards are in [`docs/personas.md`](docs/personas.md).

| Persona | Primary need | Can do |
|---|---|---|
| **Procurement Officer** | Create purchase orders and track multiple vendors | Create / edit / cancel orders, manage vendors, decide on inspections, view reports |
| **Vendor** | View assigned orders and update fulfilment status | See only their own orders; update status and estimated delivery |
| **Quality Inspector** | Record inspection results and identify defects | Record inspections with validated quantities |
| **Procurement Manager** | Monitor pending approvals, delays and order value | View everything, reports, decide on inspections |
| **Warehouse Receiver** | Record received quantities and discrepancies | Record goods receipts |

## Workflow

```mermaid
flowchart LR
    A[Create PO] --> B[Vendor updates fulfilment]
    B --> C[Warehouse records receipt]
    C --> D[Inspector records inspection]
    D --> E{Officer decision}
    E -- Approve --> F[Goods accepted]
    E -- Reject --> G[Goods rejected]
    E -- Reinspect --> D
```

Order status flow: `Draft -> Pending Approval -> Approved -> Ordered -> Partially Received -> Received`, with `Cancelled` possible before receipt. Detailed diagrams (journeys, sequence, state machines, data model) are in [`docs/user-journeys.md`](docs/user-journeys.md) and [`docs/architecture.md`](docs/architecture.md).

<details>
<summary><b>Workflow rules enforced</b></summary>

1. A purchase order must have at least one valid item.
2. Quantities must be positive integers and unit prices non-negative.
3. Received quantities must be reconciled against ordered quantities.
4. Accepted quantity plus rejected quantity must equal inspected quantity for a completed inspection.
5. Only authorised roles may approve or reject inspection outcomes.
6. Failed inspections must not automatically mark the entire order as accepted.
7. Reinspection must preserve previous inspection records.
8. Cancelled orders must not accept further fulfilment updates.
9. Every important status change records the actor, timestamp and previous / new status.
10. In the extended implementation, role checks are enforced by the backend; hiding buttons alone is not security.

</details>

## Tech stack

| Area | Technology |
|---|---|
| Language | HTML5, CSS3, JavaScript, **TypeScript** |
| UI framework | **React** with **Vite** |
| Routing | react-router-dom |
| Styling | **Tailwind CSS**, CSS Grid, Flexbox |
| Icons | lucide-react |
| Forms and validation | React Hook Form + Zod |
| State management | React Context (Redux Toolkit or Zustand if the state grows) |
| API integration | Axios or TanStack Query (planned) |
| Charts | Chart.js with react-chartjs-2 |
| Testing | Vitest, React Testing Library, API integration tests |
| Backend (stretch) | Node.js + Express with a persistent database |
| Deployment | **GitHub Pages** (live demo, `gh-pages` branch), hosting service for the REST API when built |
| Stretch features | PWA offline mode, customisable dashboards, Framer Motion, PDF/CSV export, automated performance monitoring |

Design system: a classic navy and antique-gold palette on an ivory background, a heraldic shield crest logo, Cormorant Garamond serif headings and Inter for the interface, soft layered shadows and distinct semantic colours for approved, pending, delayed, rejected and cancelled states. Accessibility targets WCAG 2.2 AA.

## Getting started

**Prerequisites:** Node.js 20 or newer and npm.

```bash
git clone https://github.com/saicharan-bugga/SupplyTrust.git
cd SupplyTrust/app
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run coverage` | Run tests with a coverage report |
| `npm run lint` | Lint the code |

Tip: add `?skipintro` to the URL to bypass the intro, or `?intro=1` to `?intro=4` to preview a specific one. Use **Settings > Reset sample data** to restore the original dataset.

## Project structure

```
SupplyTrust/
├── README.md
├── docs/                 Personas, journeys, wireframes, architecture, screenshots
└── app/                  React + Vite + TypeScript application
    └── src/
        ├── components/   Reusable UI components and their tests
        ├── pages/        One file per screen
        ├── state/        React Context (data, current user, toasts, intro)
        ├── lib/          Derived values and permissions (pure, tested)
        ├── data/         Sample dataset
        └── types.ts      Domain interfaces
```

See [`docs/architecture.md`](docs/architecture.md) for layers, data model, technology versions and the sample dataset.

## 4-week plan

> **Four-week priority:** deliver a complete purchase order-to-inspection-decision workflow before adding PWA features, animations or dashboard customisation.

| Week | Focus | Expected output | Status |
|---|---|---|---|
| **1** | Requirements, user journeys, wireframes, Git repository, React + Vite setup, Tailwind design system, routing, reusable component library | Responsive dashboard shell, design system and initial purchase order screen | **Complete** |
| **2** | Purchase order CRUD, vendor selection, search, status filters, forms, LocalStorage / JSON persistence | Working purchase order and vendor management workflows | **Complete** |
| **3** | Goods receipt, quality inspection, approval / rejection | End-to-end procurement and inspection workflow, dashboard metrics, role-specific views | **Complete** |
| **4** | Validation, responsive testing, component tests, documentation, deployment; measure Lighthouse performance and critical-path completion | MVP release, test results, README, demonstration | **Complete** |
| Month 2 *(optional)* | Node.js REST API and database; audit history, notifications, CSV / PDF export | Persistent backend and enhanced procurement features | Optional |
| Month 3 *(optional)* | PWA offline read access, dashboard customisation, advanced analytics, further performance optimisation | Extended prototype with enhanced UX | Optional |

### Week 1 checklist

- [x] Requirements finalised and documented
- [x] User journeys and workflow diagrams - [`docs/user-journeys.md`](docs/user-journeys.md)
- [x] Persona cards - [`docs/personas.md`](docs/personas.md)
- [x] Wireframes for all major screens - [`docs/wireframes.md`](docs/wireframes.md)
- [x] Git repository with documented folder structure - [`docs/architecture.md`](docs/architecture.md)
- [x] React + Vite + TypeScript setup
- [x] Tailwind design system (navy / gold theme, accessible status badges)
- [x] Routing with role-based navigation
- [x] Reusable component library with typed props and tests - **28 tests, 93.5% statement coverage** of `src/components` and `src/lib` (the documented coverage scope, set in `app/vite.config.ts`)
- [x] Responsive dashboard shell checked at phone, tablet and laptop widths
- [x] Initial purchase order screen (search, filter, sort, pagination)

### Week 2 checklist

- [x] Purchase order create / edit / cancel with Zod validation and inline errors
- [x] Vendor selection (active vendors only) and vendor management screen
- [x] Order detail page with status history and inspection summary
- [x] Allowed-transition map and role rules - [`app/src/lib/transitions.ts`](app/src/lib/transitions.ts)
- [x] Search, status filters, sorting, pagination, LocalStorage persistence
- [x] **46 tests passing**, 92% line coverage of `src/components` and `src/lib`

### Week 4 checklist

- [x] Phone, tablet and laptop layouts checked; no horizontal page scroll at 390 px (grids fixed to single column)
- [x] Accessibility: axe-core suite on 9 screens, 0 violations; low-contrast text raised
- [x] **82 tests passing**, 88% line coverage of the documented scope
- [x] Deployed: https://saicharan-bugga.github.io/SupplyTrust/
- [x] Testing report with measured numbers and honest gaps - [`docs/testing.md`](docs/testing.md)
- [x] Demo walkthrough - [`docs/demo-script.md`](docs/demo-script.md)
- [ ] Lighthouse report (needs Chrome; see testing report)

### Week 3 checklist

- [x] Goods receipt with quantity reconciliation (rule 3)
- [x] Quality inspection with accepted + rejected = inspected (rule 4) and defect records
- [x] Approval / rejection / reinspection with comments, roles enforced (rules 5, 6, 7)
- [x] Cancelled orders accept no further updates (rule 8)
- [x] Every important change logged with actor, time, previous and new status (rule 9)
- [x] Role-specific dashboards, reports, audit log, CSV and print export
- [x] **73 tests passing**, 88% line coverage of `src/components` and `src/lib`

## Evaluation

**Target metrics**
- Lighthouse Performance score above 90 under documented test conditions
- First Contentful Paint below 1.2 seconds under a documented benchmark configuration
- At least 80% test coverage for the selected React component scope, with the coverage denominator documented
- Responsive usability on phone-width and laptop layouts
- Successful completion of the critical purchase order and quality inspection workflows
- Unauthorised actions blocked in the role-enforcement implementation
- Accurate dashboard metrics based on the underlying sample records

| Evaluation area | Weight |
|---|---|
| React architecture and reusable components | 20% |
| Purchase order and vendor workflows | 20% |
| Quality inspection and approval workflow | 20% |
| State management, form validation and API integration | 15% |
| Responsive design and accessibility | 10% |
| Testing, performance and code quality | 10% |
| Documentation and final demonstration | 5% |
| **Total** | **100%** |

<details>
<summary><b>Acceptance criteria</b></summary>

1. Procurement officers can create, view and filter purchase orders.
2. Vendors can view and update only their assigned orders in the implemented authorisation model.
3. Quality inspectors can record inspection results with validated quantities.
4. Authorised procurement officers can approve, reject or request reinspection.
5. The system prevents invalid status transitions and inconsistent inspection quantities.
6. Dashboard cards and charts reflect the underlying records accurately.
7. Important workflow actions display success, error and validation feedback.
8. The interface remains usable on phone and laptop widths.
9. Critical components and workflows are tested.
10. Performance and accessibility results are documented, including the environment and measurement method.

</details>

<details>
<summary><b>Deliverables</b></summary>

- Product requirements document and user journey diagrams
- Wireframes for all major screens
- GitHub repository with clean commits and a documented folder structure
- React + Vite application with reusable components
- Responsive purchase order dashboard and order management screens
- Vendor management and vendor-specific order views
- Goods receipt and quality inspection forms
- Inspection approval, rejection and reinspection workflow
- Sample dataset with multiple vendors and different order statuses
- LocalStorage / JSON persistence for the MVP, or REST API integration for the extended version
- Form validation and workflow rules
- Component tests and critical-path test results
- Lighthouse performance and accessibility reports
- README with setup instructions, architecture overview, screenshots, role-selection instructions and known limitations
- Deployed demo on Vercel or Netlify, or a reproducible local demonstration
- Demo video or live presentation
- Optional stretch: backend API, database persistence, CSV / PDF exports, PWA, theme toggle, customisable dashboard, advanced analytics

</details>

<details>
<summary><b>Risks and mitigations</b></summary>

| Risk | Impact | Mitigation |
|---|---|---|
| Requirements expand beyond four weeks | Incomplete MVP | Prioritise the complete purchase order-to-inspection workflow |
| LocalStorage used for multi-user scenarios | Data isolated per browser | Use a persistent backend for genuine multi-user functionality |
| Role checks only in the frontend | Users may bypass authorisation | Enforce permissions on the backend in the extended implementation |
| Invalid order status transitions | Incorrect workflow outcomes | Define allowed transitions and validate every update |
| Inspection quantities inconsistent | Incorrect quality and receiving records | Validate quantity relationships before submission |
| Vendor data incomplete | Orders cannot be assigned correctly | Require essential vendor fields and validate identifiers |
| Large tables slow the UI | Poor responsiveness | Pagination, memoisation and efficient rendering |
| API requests fail or time out | Stale or incomplete data | Loading states, error handling, retries and clear recovery actions |
| Charts display misleading metrics | Poor procurement decisions | Define each metric and calculate it from validated source records |
| Export files omit filters or columns | Incomplete reports | Test exported data against selected records |
| Offline edits conflict with server data | Inconsistent records | Keep offline scope to cached reads initially |
| Performance targets vary by device | Inconsistent evaluation | Document the Lighthouse configuration and test environment |
| Sample data too limited | Weak workflow demonstration | Include normal, delayed, partially received, rejected and completed orders |

</details>

## Known limitations

- Data is stored in the browser's LocalStorage, so it is per-browser and not shared between users.
- Roles are enforced in the interface only; secure multi-user workflows need the planned Node.js backend.
- Lighthouse scores were not obtained (the tool could not run on the development machine); performance targets are unverified. See [`docs/testing.md`](docs/testing.md).
- Colour contrast was improved but not formally measured; automated accessibility checks cover structure, names and roles (0 violations on 9 screens).
- No real authentication: the user switcher is a demo role selector.
- Exports are CSV and browser print / PDF; there is no server-side PDF generation.

## Team

| Role | Name |
|---|---|
| Student 1 | **Lingala Navadeep** |
| Student 2 | **Sai Charan Bugga** - [@saicharan-bugga](https://github.com/saicharan-bugga) |
| Mentor / Reviewer | **Tanishka** |

<div align="center">

<sub>SupplyTrust - PRD v0.1 - PST_PD_007 - Batch 2026</sub>

</div>
