# SupplyTrust

Multi-vendor purchase order management and quality inspection approval workflow (OJT project PST_PD_007).

## Tech stack
React 19, TypeScript, Vite, Tailwind CSS 4, react-router-dom, React Hook Form + Zod, Chart.js, Vitest + React Testing Library.

## Run locally
```
cd app
npm install
npm run dev
```
Other scripts: `npm run build`, `npm test`.

## Roles (demo)
There is no login. Pick a demo user from the dropdown in the header to switch role: Procurement Officer, Procurement Manager, Quality Inspector, Warehouse Receiver, or one of three Vendors (vendors only see their own orders). Data is stored in the browser's LocalStorage; use Settings > Reset sample data to restore it.

## Status
- [x] Week 1: project setup, design system, routing, app shell, dashboard, purchase order list (search, filter, sort, pagination)
- [ ] Week 2: order create/edit/cancel, vendor management, persistence flows
- [ ] Week 3: goods receipt, inspection, approval workflow
- [ ] Week 4: validation, responsive testing, test coverage, Lighthouse, deployment

## Known limitations
Roles are enforced in the UI only (LocalStorage prototype); real authorization needs a backend.
