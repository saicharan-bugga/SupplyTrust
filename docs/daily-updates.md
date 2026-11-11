# SupplyTrust - Daily Log Book (Week 1 and Week 2)

**Project:** SupplyTrust - purchase order and quality inspection approval system (PST_PD_007)
**Team:** Lingala Navadeep, Sai Charan Bugga
**Mentor:** Tanishka

This is my daily log for the first 2 weeks (10 working days) of the OJT project.

| Week | What I worked on |
|---|---|
| Week 1 | Understanding the PRD, personas, journeys, wireframes, project setup, dashboard and first PO screen |
| Week 2 | Create / edit / cancel purchase order, order details page, vendor management, status rules, tests |

---

# Week 1

## Day 1 - Understanding the requirements
- Read the whole PRD carefully and made notes on what the project must do.
- Understood the problem: purchase orders, vendor updates and quality checks are all in different places (excel and emails), so it is hard to see delayed orders and pending approvals.
- Listed the 7 order statuses (Draft, Pending Approval, Approved, Ordered, Partially Received, Received, Cancelled) and the 4 inspection results.
- Wrote down the 10 workflow rules from the PRD so I do not forget them while coding.
- Divided the work into must-have, good-to-have and out of scope.

**Problem faced:** The PRD is long and some rules were confusing at first (like reinspection). I read it twice and made a small note for each rule.
**Tomorrow:** Personas and user journeys.

## Day 2 - Personas and user journeys
- Made persona cards for the 5 roles: Procurement Officer, Vendor, Quality Inspector, Procurement Manager and Warehouse Receiver. For each one I wrote what they need and what problems they face.
- Drew the user journey diagrams: create PO, vendor update, goods receipt, inspection, and approve / reject / reinspect.
- Wrote the status flow of an order from Draft till Received.

**Files:** `docs/personas.md`, `docs/user-journeys.md`
**Tomorrow:** Wireframes.

## Day 3 - Wireframes
- Made 12 wireframes: Dashboard, PO List, Create PO, PO Details, Vendor Management, Vendor Portal, Goods Receipt, Quality Inspection, Approval Queue, Inspection Details, Reports, Settings.
- Decided the states each screen needs: loading, empty, error, success, no search result and invalid form.
- Planned how each screen looks on phone, tablet and laptop.

**Files:** `docs/wireframes.md` and the SVG files in `docs/wireframes/`
**Tomorrow:** Create the repo and set up the project.

## Day 4 - Repo and project setup
- Created the GitHub repository and made the folders (`app/` for code, `docs/` for documents).
- Set up React + Vite + TypeScript with Tailwind CSS, react-router, React Hook Form, Zod, Chart.js and Vitest.
- Wrote the TypeScript types for users, vendors, orders, items, receipts, inspections, approvals and status history.
- Made the sample data: 4 vendors and 8 orders with different statuses, plus receipts and inspections.
- Chose the colours (dark teal and gold) and designed the SupplyTrust logo and the intro animation.

**Problem faced:** I did not like the first logo and colours, so I changed the design a few times before finalising.
**Tomorrow:** Routing and components.

## Day 5 - Routing, components, dashboard and tests
- Added routing and the main layout with a role switcher (no real login, just choose a role).
- Built the reusable components: AppLayout, DashboardCard, PurchaseOrderTable, OrderStatusBadge, SearchFilterBar, VendorSelector, OrderTimeline, ConfirmDialog and NotificationToast.
- Built the dashboard cards and the PO list with search, status filter, sorting and pagination.
- Values like order total, delay days and outstanding quantity are calculated, not stored.
- Data is saved in LocalStorage and there is a reset button in settings. A vendor can see only their own orders.
- Wrote 28 tests and checked coverage (about 93%).
- Checked the pages on phone, tablet and laptop sizes.
- Wrote the README with screenshots and setup steps.

**Problem faced:** The sidebar was overlapping the content on phone. I fixed it by changing the layout.
**Result:** Week 1 completed and pushed to GitHub.
**Next week:** Create / edit / cancel PO and vendors.

---

# Week 2

## Day 6 - Create purchase order form
- Made the Create Purchase Order page with vendor dropdown (only active vendors), expected delivery date and item rows.
- User can add and remove item rows. Each row has product name, SKU, quantity and unit price. The total updates live.
- Added validation using React Hook Form and Zod: vendor required, date required, at least one item, quantity must be a whole number above 0, price cannot be negative.
- Error messages show under each field.
- Added two buttons: Save as draft and Submit for approval.

**Problem faced:** The number fields were giving text instead of numbers, so validation failed. Fixed it by using `valueAsNumber`.
**Tomorrow:** Saving, editing and status rules.

## Day 7 - Saving, editing and status rules
- New orders are saved in LocalStorage with an auto generated number like PO-2026-009.
- Added edit page. An order can be edited only while it is Draft or Pending Approval.
- Made the allowed status changes map (for example Draft -> Pending Approval -> Approved -> Ordered) and blocked all other changes.
- Every status change is saved in history with who did it, when, and the old and new status.
- Wrote unit tests for the status rules and the form schema.

**Problem faced:** I had to decide which role can do which status change. I put it in one place (`lib/transitions.ts`) so it is easy to change.
**Tomorrow:** Order details page and cancel.

## Day 8 - Order details page and cancel order
- Built the PO details page showing items, line totals, order total, expected delivery, received and outstanding quantity.
- Shows a "Delayed" badge and number of days when the order is late.
- Added the status history timeline and the inspection summary on the page.
- Added action buttons (submit, approve, mark as ordered, edit) which show only for the roles allowed.
- Cancel order opens a confirmation popup first. Cancelled orders cannot be changed again.
- Order numbers in the list and dashboard now open this page.

**Tomorrow:** Vendor management.

## Day 9 - Vendor management
- Built the Vendors page with cards showing name, email, contact, status and number of orders.
- Added "Add vendor" form with validation (name, valid email, contact number).
- Added Activate / Deactivate button. Inactive vendors do not appear in the vendor dropdown, so new orders cannot be made for them.
- Only the Procurement Officer can add or change vendors. Other roles can only view.
- Added a link from each vendor to their orders.
- Vendor login still sees only their own orders, and opening another vendor's order shows a "no access" message.

**Tomorrow:** Testing and checking.

## Day 10 - Testing and Week 2 release
- Wrote tests for: creating an order, validation errors, edit rules, invalid status change, cancel, and vendor access.
- Checked the new pages on phone, tablet and laptop sizes.
- Checked empty states, error messages and keyboard use of the forms.
- Ran type check, lint and all tests.
- Updated the README for Week 2 and pushed everything to GitHub.

**Result:** Week 2 completed. PO create, edit, cancel, details page and vendor management are working.
**Next week:** Goods receipt, quality inspection and approval.

---

## Summary

| Day | Work | Status |
|---|---|---|
| 1 | Requirements | Done |
| 2 | Personas and journeys | Done |
| 3 | Wireframes | Done |
| 4 | Repo, setup, data model, design | Done |
| 5 | Routing, components, dashboard, tests | Done |
| 6 | Create PO form and validation | Done |
| 7 | Save, edit, status rules | Done |
| 8 | Order details and cancel | Done |
| 9 | Vendor management | Done |
| 10 | Testing and release | Done |
