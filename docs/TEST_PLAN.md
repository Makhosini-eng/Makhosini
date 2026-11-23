# Test Plan

## Automated development checks

Run `npm test`, `npm run check`, `npm run test:browser` and `python -m unittest discover -s tools -p 'test_*.py'`.

Coverage includes:
- task creation, schema validation, stable deduplication and action allowlists;
- sensitive-action approval, exact task/action/scope matching, approval expiry and bounded retry;
- health endpoint, ingress authentication, missing-secret fail-closed behaviour, duplicate suppression and approval-required tasks not being queued;
- incremental request-body limits, early stream cancellation, invalid UTF-8 rejection;
- atomic approval insertion, task-state transition and audit event; concurrent approval requests must produce one success and one conflict;
- synthetic browser approval preview and Python analytics/document-adapter behaviour.

## Staging tests — not run

- Apply `schema.sql` to disposable D1 and verify constraints/indexes/foreign keys.
- Send synthetic ingress events with valid and invalid credentials.
- Replay events and verify one task record.
- Verify approval expiry and scope mismatch rejection against D1.
- Verify the concurrent approval transaction against D1.
- Verify queue consumer blocks all tasks while adapters are absent.
- Simulate queue send failure after persistence and test recovery once outbox support exists.
- Inspect logs for secret and payload leakage.
- Verify request-size limits at the deployed edge, including chunked bodies without Content-Length.

## Production acceptance — blocked

Requires provider webhook verification, replay protection, independently authenticated approver identity, queue outbox/reconciliation, reviewed specialist adapters, rate limiting, monitoring, backups, restore and rollback tests, reproducible dependency lockfiles and a blocking security baseline.
