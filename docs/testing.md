# Testing, accessibility and performance report

All numbers below were measured on the development machine (Windows 11, Microsoft Edge, localhost). They are honest results, not targets.

## Automated tests

| Item | Result |
|---|---|
| Runner | Vitest 5 + React Testing Library, jsdom |
| Test files | 13 app files, plus 1 server API file |
| Tests | **98 app tests passing** (Vitest) and **9 server API tests passing** (`node --test` in `server/`) |
| Coverage scope (denominator) | `src/components/**` and `src/lib/**` (reusable components and pure domain logic); pages are covered by the accessibility suite and manual runs |
| Line coverage of that scope | **86.5% lines, 82.6% statements** as of 2026-11-25 (above the 80% target; `src/lib` 98.8%, `src/components` 78.0%) |

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

**Lighthouse (measured 2026-11-22)** with Lighthouse 13.6 driving headless Microsoft Edge against the deployed site (`https://saicharan-bugga.github.io/SupplyTrust/`), on the development laptop:

| Preset | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Desktop | **99** | **100** | **100** | **100** | 0.3 s | 1.0 s | 50 ms | 0 |
| Mobile (simulated 4x CPU and slow 4G), earlier build | 53 to 86 | 100 | 100 | 100 | 0.8 to 2.1 s | 3.4 to 3.9 s | 0.1 to 4 s | 0.003 |
| Mobile, after non-blocking fonts (2026-11-25, 3 runs) | 89, 89, 93 | not re-run | not re-run | not re-run | 0.9 to 1.0 s | 3.3 to 3.6 s | 60 to 150 ms | 0 |

On 2026-11-25 the Google Fonts stylesheet was changed from render-blocking to non-blocking and to variable-weight files; mobile FCP fell from 1.9 s to about 1.0 s (meets the 1.2 s target). Mobile LCP is still 3.3 to 3.6 s because the dashboard heading appears only after the JavaScript bundle runs under 4x CPU slowdown, so mobile performance is 89 to 93: above 90 in one of three runs. Further gains would need pre-rendering, which was not attempted.

The desktop result meets the Performance above 90 target. Mobile performance was **not** reliably above 90: repeated runs on the same build varied from 53 to 86 because the simulated CPU throttling is very sensitive to other load on this machine, so only the range is reported. The mobile FCP target of 1.2 s was met in some runs and missed in others. Accessibility, best-practices and SEO were stable at 100 after labelling the demo-user selector and adding a meta description. The main script bundle was reduced from about 718 KB to about 316 KB by lazy-loading each page.

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
