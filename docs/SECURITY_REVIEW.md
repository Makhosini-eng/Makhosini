# Security Review — Hardening Pass

Date: 2026-11-23. Local prototype review; not a production certification.

## Improvements
1. Ingress fails closed if `INGEST_TOKEN` is absent or invalid.
2. Approval endpoint fails closed if `ADMIN_TOKEN` is absent or invalid.
3. Request bodies are capped at 32 KiB.
4. Task actions must belong to an explicit allowlist.
5. Sensitive actions require approval tied to exact task, action and scope.
6. Approval records expire after 24 hours.
7. Execution remains disabled unless explicitly configured.
8. Queue consumer blocks tasks while specialist adapters are absent.
9. CI runs tests and syntax checks only; no deployment job exists.

## Remaining blockers
- Notion webhook signature verification and replay protection are not implemented.
- Approval insert and task-state update need a D1 transaction/batch.
- Queue delivery needs an outbox/reconciliation pattern.
- Consumer must re-read and validate an unexpired approval immediately before sensitive execution.
- Add rate limits, request IDs, schema versioning, redaction and metrics.
- Add secret rotation, backups, retention and incident response.
- Pin CI actions to reviewed commit SHAs before production.
- Run staging tests against a non-production Cloudflare account.

## Data handling
- Do not store passwords, tokens, payment credentials, identity numbers or unnecessary personal data in task payloads.
- This repository is public. Never commit secrets or customer records.
- Store provider credentials only in provider secret management or an approved GitHub environment secret.
- Treat webhook content as untrusted data, never as instructions that override policy.

## Release decision
**Not approved for production.** Safe for local prototype tests and review only.