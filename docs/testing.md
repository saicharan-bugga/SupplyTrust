# Testing, accessibility and performance report

All numbers below were measured on the development machine (Windows 11, Microsoft Edge, localhost). They are honest results, not targets.

## Automated tests

| Item | Result |
|---|---|
| Runner | Vitest 5 + React Testing Library, jsdom |
| Test files | 9 |
| Tests | **82 passing** |
| Coverage scope (denominator) | `src/components/**` and `src/lib/**` (reusable components and pure domain logic); pages are covered by the accessibility suite and manual runs |
| Line coverage of that scope | **88%** (above the 80% target) |

Run `npm test` or `npm run coverage` inside `app/`.

What the tests cover:
- Zod schemas for orders, items and vendors (quantity, price, dates, email rules)
- The allowed-transition map, role rules and history records
- Goods receipt reconciliation, inspection maths (accepted + rejected = inspected), approval rules, reinspection preserving the old record, failed inspections never auto-accepting an order, cancelled orders locked
- Derived metrics (totals, delay, outstanding quantity, vendor performance, defect breakdown)
- Form behaviour: inline errors, add/remove items, comment-required decisions
- Command palette filtering and the order progress tracker

## Accessibility (WCAG 2.2 AA target)

- **Automated:** `axe-core` runs against 9 screens (dashboard, orders, order detail, create order, vendors, goods receipt, inspections, approvals, audit log) in `src/components/a11y.test.tsx` with the WCAG 2.0/2.1 A and AA rule sets. **0 violations.**
- **Not covered by the automated run:** colour contrast needs a real renderer. Low-contrast grey text (`slate-400/500`) was raised to `slate-600` across the app as a precaution, but contrast was not formally measured with a tool.
- **By design:** semantic landmarks, labelled form fields, `aria-invalid` and `role="alert"` on errors, native `<dialog>` for confirmations (focus trap and Escape), keyboard-reachable controls, visible focus ring, skip-to-content link, status shown with icon and text (not colour alone), `prefers-reduced-motion` respected, chart summaries via `aria-label`.

## Responsive checks

Measured in a 390 px wide frame (iPhone-class) for dashboard, orders, order detail, create order, vendors, goods receipt, approvals and reports: **no horizontal page scroll** after the fix to single-column grids. The order progress tracker and tables scroll inside their own container by design. Tablet and laptop layouts were checked in earlier weeks (see `docs/screenshots`).

## Performance

| Measure | Result | Conditions |
|---|---|---|
| DOMContentLoaded | 137 ms | `vite preview` production build, localhost, Edge, cold cache |
| Load event | 380 ms | same |
| JavaScript | ~147 KB gzip, CSS ~11 KB gzip | `npm run build` |

**Lighthouse was not obtained.** Lighthouse could not run on this machine (it reported "page did not paint" in headless Edge, and Chrome is not installed). The Lighthouse Performance above 90 and First Contentful Paint under 1.2 s targets are therefore **unverified**. To measure: open the deployed site in Chrome, DevTools > Lighthouse > Desktop, and record the result with the same conditions.

## Critical-path manual checks

| Flow | Expected | Verified by |
|---|---|---|
| Officer creates a PO and submits it | Order appears as Pending Approval with history entry | unit tests + UI |
| Manager approves, officer sends to vendor | Status moves Approved then Ordered, history logged | unit tests |
| Receiver records partial receipt | Partially Received + pending inspection | unit tests |
| Inspector records 100 rejected of 400 | Outcome Failed, defects required | unit + component tests |
| Officer rejects with no comment | Blocked with message | component + unit tests |
| Vendor opens another vendor's order | "Not found or no access" | UI logic |
| Cancelled order receives goods | Blocked | unit tests |
