# Activepieces → CAPITAL KING task-engine integration contract

**Status:** adapter implemented and unit-tested with a synthetic fetch stub; not connected to a deployed service.  
**Branch:** `capital-king/poc-automation-security-2026-11`  
**Data:** synthetic records only.

## Boundary

Activepieces must call the task engine's authenticated `POST /events/task` ingress. The Worker implementation is in `src/worker.mjs`; it requires the `INGEST_TOKEN` secret, validates the task schema, persists the task, deduplicates by the stable source/event identity and writes an audit event. This endpoint is present in source but no live endpoint, secret, database or queue has been configured or tested as part of this POC.

The adapter in `src/adapters/activepieces-task-client.mjs`:

- requires HTTPS; permits plain HTTP only for localhost tests;
- rejects URL credentials, query strings and fragments;
- requires a configured bearer secret (never store it in a flow export or source file);
- validates required event fields, department and action catalogue before network access;
- posts only to the fixed `/events/task` path;
- refuses redirects and does not retry automatically;
- returns the engine's duplicate acknowledgement so a caller can observe idempotent delivery;
- surfaces HTTP rejection codes without echoing the bearer token.

## Event contract

Required fields: `title`, `department`, `source`, `eventId`, `taskType`. Optional fields: `priority`, `action`, `approvalRequired`, `maxRetries`, `payload`. Use a stable event ID across retries. The task engine remains authoritative for full validation and duplicate handling.

Example synthetic event:

```json
{
  "title": "Review synthetic lawn-care lead",
  "department": "customer",
  "source": "activepieces-poc",
  "eventId": "lead-demo-001",
  "taskType": "lead_qualification",
  "action": "qualify_prospects",
  "payload": { "leadId": "synthetic-001", "email": "lead@example.test" }
}
```

## Human approval and side-effect policy

Task creation is not permission to execute an external action. Actions in the approval-required catalogue remain blocked pending a distinct human approval record scoped to the exact action. The Activepieces flow must not add email, SMS, social publishing, payment, account-setting or deployment steps. Do not treat a lead's contact details as proof of consent.

## Deployment gate (not yet satisfied)

1. Provision a private, isolated Worker environment and database/queue using approved infrastructure.
2. Configure `INGEST_TOKEN` as a secret in the Worker and a separate secret store in Activepieces; never place it in JSON exports, logs or Git.
3. Confirm ingress is reachable only through the intended private route; do not expose an unauthenticated public webhook.
4. Run synthetic create, duplicate, malformed-schema, unauthorized and service-unavailable tests.
5. Verify audit rows and queue state; confirm approval-required tasks are not queued for execution.
6. Record teardown and secret-rotation evidence.

No deployment, secret creation, infrastructure spend, live connector, customer record import or outbound action is authorized by this code-only POC.
