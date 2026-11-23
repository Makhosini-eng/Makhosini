# Security Review — Repository Hardening Pass

Date: 2026-11-24. Development-branch review only; not a production certification.

## Verified corrections in this pass

1. **Bounded request-body reads:** the Worker now reads the request stream incrementally, stops and cancels the stream as soon as the 32 KiB limit is exceeded, and rejects malformed UTF-8. It no longer buffers an arbitrarily large body before applying the limit.
2. **Atomic approval state transition:** approval insertion, conditional task-state transition and approval audit insertion now run in one D1 batch transaction. The conditional insert only claims a task still awaiting approval; the state update must consume that exact approval claim. A concurrent second approval is rejected instead of creating another approval record.
3. **Approval input bounds:** the claimed operator label and approval ID have explicit maximum lengths.
4. **CI action pinning:** the legacy Hybrid Engine workflow now pins checkout and setup-node to verified full commit SHAs and uses the Node 24-compatible action releases. The Quality Gates workflow uses the same pinned checkout release.

## Regression coverage added

- Streamed request exceeding 32 KiB is rejected with HTTP 413 and the body stream is cancelled.
- Invalid UTF-8 is rejected before persistence.
- Successful approval commits the approval, task transition and audit event.
- Concurrent approval requests result in one success and one conflict, with exactly one approval and one audit record.

These tests are committed on `capital-king/poc-automation-security-2026-11`; their pass/fail status must be taken from the CI run for the latest commit, not from earlier runs.

## Remaining security blockers

- The `approvedBy` value is still a caller-supplied label authenticated only by the shared `ADMIN_TOKEN`; it is not a verified human identity. Do not treat it as strong non-repudiation evidence.
- Queue dispatch is still outside the D1 transaction. A durable outbox/reconciliation pattern is required before enabling execution.
- The queue consumer intentionally blocks work because specialist adapters are not implemented. No external side effects should be enabled.
- Notion webhook signature verification and replay protection are not implemented.
- The Worker has not been deployed to a staging Cloudflare account. D1 schema, queue bindings, token rotation, rate limiting, backup/restore, logging redaction and real-provider integration remain unverified.
- CI dependency installation is not yet based on a committed npm lockfile; the current npm install path is not a fully reproducible dependency supply-chain boundary.
- Trivy is report-only and its current scan did not produce a Python installed-package licence inventory or supported IaC scan. Secret-scan coverage must be independently verified. A clean HIGH/CRITICAL table is not a full security certification.
- The repository commit is unsigned. Signed commits and a verified release provenance process remain future hardening work.

## Data handling

- Do not store passwords, tokens, payment credentials, identity numbers or unnecessary personal data in task payloads.
- This repository is public. Never commit secrets or customer records.
- Store provider credentials only in provider secret management or an approved GitHub environment secret.
- Treat webhook content as untrusted data, never as instructions that override policy.

## Release decision

**Not approved for production.** Safe for local prototype tests and review only. Keep execution disabled until the remaining blockers are addressed and staging evidence is recorded.
