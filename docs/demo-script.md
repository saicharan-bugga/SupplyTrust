# Demo walkthrough (about 5 minutes)

Open https://saicharan-bugga.github.io/SupplyTrust/ (or run `npm run dev` in `app/`). Use Settings > Reset sample data before starting.

1. **Intro and dashboard** - a classic intro plays, then the executive dashboard. Point out the KPI cards, order pipeline, quality health ring and the "your work today" cards.
2. **Create a PO (Anita Rao, Procurement Officer)** - Purchase orders > New order. Submit empty to show inline validation. Pick a vendor (inactive Delta Fasteners is not offered), add two items, watch the total update, click Submit for approval.
3. **Approve and send (Rahul Mehta, Manager)** - switch user, open the order, Approve. Switch back to Anita, Send to vendor. Open the order and show the progress tracker and status history.
4. **Vendor view (Sunil Verma, Apex)** - only Apex orders are visible; update an expected delivery date.
5. **Goods receipt (Karthik Iyer, Receiver)** - Goods receipt > record a partial quantity; try more than outstanding to show the block.
6. **Inspection (Priya Nair, Inspector)** - Quality inspection > start; enter 100 rejected out of 400, note defects are required, save. Outcome is Failed.
7. **Decision (Anita)** - Approval queue. Try to reject with no comment (blocked), then request reinspection and show the old record is kept and a new one opens.
8. **Reports and audit** - Reports (charts, vendor scorecard, CSV, Print), Audit log shows every action.
9. **Extras** - Ctrl + K command palette, dark theme toggle, phone-width layout.
