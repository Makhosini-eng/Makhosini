# Test Plan

## Local tests
Run `npm test` and `npm run check`.

Coverage: valid task creation, stable deduplication, invalid department/action rejection, sensitive-action approval, exact task/action/scope matching, approval expiry, bounded retry, specialist contract completeness, health endpoint, ingress authentication, fail-closed missing secret, duplicate suppression, approval-required tasks not queued, payload-size limit and approval scope mismatch.

## Staging tests — not run
- Apply `schema.sql` to disposable D1 and verify constraints/indexes/foreign keys.
- Send synthetic ingress events with valid and invalid credentials.
- Replay events and verify one task record.
- Verify approval expiry and scope mismatch rejection.
- Verify queue consumer blocks all tasks while adapters are absent.
- Simulate queue send failure after persistence and test recovery once outbox support exists.
- Inspect logs for secret and payload leakage.

## Production acceptance — blocked
Requires provider webhook verification, atomic approval persistence, queue outbox/reconciliation, reviewed specialist adapters, monitoring, backups and rollback tests.