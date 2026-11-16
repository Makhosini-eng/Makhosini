# CAPITAL KING Sales Desk — MVP

A zero-dependency, offline-first prospect tracker.

## Run it

1. Download or clone this repository.
2. Open `app/index.html` in a modern browser.
3. Add a real prospect, select the offer and pipeline stage, and record the next follow-up date.
4. Use **Export CSV** regularly to keep a backup.

## Included

- Add and edit prospects.
- Track pipeline stage, offer, contact channel, optional potential value and follow-up date.
- Search and filter the pipeline.
- Summary counts for prospects, due follow-ups, offers sent and won.
- CSV export.

## Data and safety

- Records are stored in browser `localStorage` on the device where the page is opened.
- There is no account, cloud sync, server, external API, analytics or third-party dependency.
- Clearing browser data can erase records. Export CSV backups.
- Do not store passwords, bank details, identity documents or sensitive customer information.
- The app does not send messages, contact prospects, publish content, process payments or sync with Notion.

## Current limitations

This is a local prototype, not a hosted multi-user SaaS. It has not been security-audited or tested across a device/browser matrix. Before using it for operational customer records, add automated tests, a tested backup/restore path and a privacy review.