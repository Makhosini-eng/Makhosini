# CAPITAL KING Hybrid Specialist Engine

**Status: hardened preparation build.** Local tests pass. Not connected to Notion or Cloudflare, not deployed, and not authorized for production execution.

## Purpose
Controlled task routing for Product Builder & QA, Customer & Demand, and Operations & Revenue Control.

## Requirements
- Node.js 20 or newer
- No third-party npm dependencies for local tests

## Local verification
```bash
npm test
npm run check
```

## Components
- `src/core.mjs`: validation, strict action catalogue, deduplication, approval-scope validation, retries and specialist contracts.
- `src/worker.mjs`: fail-closed ingress, request size limit, D1 persistence and exact-scope approval endpoint.
- `src/queue-consumer.mjs`: safe-mode consumer; blocks execution until specialist adapters are reviewed.
- `schema.sql`: D1 schema.
- `wrangler.toml.example`: placeholder configuration; execution disabled by default.
- `.github/workflows/ci.yml`: test and syntax checks only; no deployment.
- `docs/`: architecture, security, integration and deployment documentation.
- `tests/`: synthetic local tests.

## Safety defaults
- `EXECUTION_MODE=disabled`.
- Missing ingress/admin secrets fail closed.
- Unknown actions are rejected.
- Sensitive actions require exact-task and exact-action approval.
- Approval expires after 24 hours.
- Request payload limit is 32 KiB.
- No specialist side effects are implemented.
- No secrets or customer data belong in this public repository.

## Not production-ready
Provider-specific webhook signature verification, transactional approval persistence, queue outbox/reconciliation, specialist adapters, monitoring, backups, rate limiting, staging tests and production security review remain outstanding. See `docs/SECURITY_REVIEW.md` and `docs/DEPLOYMENT_RUNBOOK.md`.