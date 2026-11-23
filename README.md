# CAPITAL KING Hybrid Specialist Engine

**Status: hardened preparation build.** Latest Quality Gates run #102 passed the automated Node, browser, Python and blocking Trivy checks. Not connected to Notion or Cloudflare, not deployed, and not authorized for production execution.

## Purpose

Controlled task routing for Product Builder & QA, Customer & Demand, and Operations & Revenue Control.

## Requirements

- Node.js 20 or newer (CI uses Node 22 for the legacy Hybrid Engine workflow).
- Core Node unit tests use built-in Node modules; Playwright is a pinned development dependency for browser tests.

## Local verification

```bash
npm test
npm run check
npm install --ignore-scripts --no-audit --no-fund --package-lock=false
npx playwright install chromium
npm run test:browser
```

## Components

- `src/core.mjs`: validation, strict action catalogue, deduplication, approval-scope validation, retries and specialist contracts.
- `src/worker.mjs`: fail-closed ingress, incremental 32 KiB request-body cap, D1 persistence and atomic approval batch.
- `src/queue-consumer.mjs`: safe-mode consumer; blocks execution until specialist adapters are reviewed.
- `schema.sql`: D1 schema.
- `wrangler.toml.example`: placeholder configuration; execution disabled by default.
- `.github/workflows/ci.yml`: test and syntax checks only; no deployment.
- `.github/workflows/quality-gates.yml`: Node/browser/Python tests, blocking HIGH/CRITICAL vulnerability/misconfiguration checks, blocking repository secret scan, and report-only licence inventory.
- `docs/`: architecture, security, integration and deployment documentation.
- `tests/`: synthetic local tests, including streamed body-limit and concurrent-approval regression tests.

## Safety defaults

- `EXECUTION_MODE=disabled`.
- Missing ingress/admin secrets fail closed.
- Unknown actions are rejected.
- Sensitive actions require exact-task and exact-action approval.
- Approval expires after 24 hours.
- Request payload limit is 32 KiB and is enforced while streaming.
- No specialist side effects are implemented.
- No secrets or customer data belong in this public repository.

## Not production-ready

Provider-specific webhook signature verification and replay protection, authenticated approver identity, queue outbox/reconciliation, specialist adapters, monitoring, backups, rate limiting, committed transitive dependency lockfiles, staging tests and production security review remain outstanding. Trivy licence coverage is incomplete for Python installed packages and Docling models. See `docs/SECURITY_REVIEW.md` and `docs/DEPLOYMENT_RUNBOOK.md`.