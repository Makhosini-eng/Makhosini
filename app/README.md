# CAPITAL KING Service Desk MVP

A no-cost, browser-based first product for small service businesses: cleaning, lawn care, construction, and maintenance/repairs.

## Run it

1. Open `app/index.html` in a modern browser, or publish the `app/` folder using a static website host.
2. Select **Load sample data** to explore the workflow with fictional records.
3. Add an enquiry, prepare a quote with one or more priced line items, and convert an accepted quote into a job.
4. Update job status from the Jobs view.
5. Generate the daily report and export JSON/CSV backups from Data tools.

No package installation, API key, paid subscription, or server is required for this prototype.

## What works

- Enquiry capture with contact, service, description and date.
- Quotation preparation with multiple line items and calculated totals in ZAR.
- Quote preview, clearly marked as prepared and not sent.
- Job creation from a saved quotation and status tracking.
- Follow-up message drafts; the app does not send messages.
- Daily operations summary.
- JSON backup and jobs CSV export.
- Fictional sample data and local data reset.

## Important prototype limitations

- Records are stored in the current browser's local storage on the current device. They do not sync between devices or users.
- There is no login, role-based access, encrypted server database, automated backup, audit trail or multi-tenant isolation.
- Do not enter real customer personal information, payment details, identity numbers, passwords or confidential business records.
- Quotes are estimates generated from manually entered line items. The business owner must verify scope, quantities, rates, tax treatment, validity and terms before sending.
- Follow-ups are drafts only. No WhatsApp, email, SMS, payment collection or other external action is connected.
- This is a functional prototype, not yet a production-ready SaaS.

## Before accepting real customers

1. Add a secure backend and database with per-business tenant isolation.
2. Add authentication, least-privilege access, server-side validation, rate limiting and audit logs.
3. Add encrypted transport, secure secret management, backup/restore and retention/deletion controls.
4. Define a privacy notice and lawful processing workflow appropriate to the business and applicable law (including South Africa's POPIA where relevant).
5. Add tests, accessibility checks and security review.
6. Add integrations only after explicit authorization and user-visible confirmation before sending messages or changing records.

## Product direction

The next milestone is a secure multi-user backend and a customer-ready quotation document. Keep all external communications in draft mode until a human approves each send.
