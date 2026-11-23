# Deployment Runbook — Not Yet Authorized for Execution

This is a preparation checklist, not an instruction to deploy now.

## Provider access blockers
- No Cloudflare connector or verified account authorization is available in the current environment.
- No verified Cloudflare account ID, API token, D1 database ID or Queue exists in project context.
- Do not paste credentials into chat or commit them to Git.
- User-controlled secure Cloudflare authorization or secret setup is required before staging.

## Required resources
1. Worker `capital-king-task-engine`.
2. D1 database `capital-king-tasks`, created from `schema.sql`.
3. Queue `capital-king-tasks`.
4. Worker bindings `DB` and `TASK_QUEUE`.
5. Secrets `INGEST_TOKEN` and `ADMIN_TOKEN`, configured through Cloudflare secret management.
6. Runtime variable `EXECUTION_MODE=disabled` until specialist adapters and security review are complete.

## Staging gates
- Confirm free-tier quota and billing settings in the user's Cloudflare account.
- Confirm no paid plan or add-on is enabled.
- Apply schema to a staging database and verify constraints.
- Run synthetic ingress, duplicate, invalid-token, oversized-payload and approval-scope tests.
- Verify consumer blocks tasks while adapters are absent.
- Confirm logs redact credentials and sensitive payloads.
- Record deployment ID, environment, timestamp, test evidence and rollback method.

## Production gates
Provider webhook verification, replay protection, atomic approvals, queue outbox/reconciliation, reviewed specialist adapters, monitoring, backups and rollback tests must all pass. A human must approve the exact production deployment and execution scope.

## Rollback
- Disable queue consumer or set execution mode to disabled.
- Rotate ingress/admin tokens if exposed.
- Preserve audit records for incident review.
- Do not delete D1 as a first response; preserve evidence before destructive recovery.