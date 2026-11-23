# Security Review — Repository Hardening Pass

Date: 2026-11-24. Development-branch review only; not a production certification.

## Verified corrections

1. **Bounded request-body reads:** the Worker reads request streams incrementally, stops and cancels as soon as the 32 KiB limit is exceeded, and rejects malformed UTF-8.
2. **Atomic approval transition:** approval insertion, conditional task-state transition and audit insertion run in one D1 batch transaction. A concurrent second approval is rejected rather than creating a second approval record.
3. **Approval input bounds:** operator label and approval ID have explicit maximum lengths.
4. **CI action pinning:** checkout and setup-node use verified full commit SHAs; the workflows use Node 24-compatible action releases.
5. **Blocking security checks:** Trivy now fails the Quality Gates workflow on HIGH/CRITICAL vulnerability or misconfiguration findings and on detected repository secrets. Licence inventory remains report-only while coverage is incomplete.

## Verification evidence

Latest Quality Gates run #102 on commit `83a1376fd736b44d460a5dcd08445d39e3fd011b` passed:
- 29 Node tests, 0 failures.
- 2 Playwright browser tests passed.
- 7 Python tests passed.
- Blocking Trivy vulnerability/misconfiguration scan passed; no HIGH/CRITICAL findings were reported for the generated npm lockfile or the two direct Python requirements manifests.
- Dedicated Trivy secret-scan command completed successfully with no secret findings reported.

Run: https://github.com/Makhosini-eng/Makhosini/actions/runs/45291994524

The Trivy output still has coverage limits: it does not show an explicit per-file clean inventory for secret scanning, the pip licence scanner skipped because it did not find a `site-packages` directory, and no supported IaC configuration files were detected. These are not equivalent to proof that all files, licences or infrastructure configuration are clean.

## Regression coverage added

- Streamed request exceeding 32 KiB returns HTTP 413 and the stream is cancelled.
- Invalid UTF-8 is rejected before persistence.
- Successful approval commits the approval, task transition and audit event.
- Concurrent approval requests result in one success and one conflict, with exactly one approval and one audit record.

## Remaining security blockers

- The `approvedBy` value is a caller-supplied label authenticated only by the shared `ADMIN_TOKEN`; it is not a verified human identity. Do not treat it as strong non-repudiation evidence.
- Queue dispatch remains outside the D1 transaction. A durable outbox/reconciliation pattern is required before enabling execution.
- The queue consumer intentionally blocks work because specialist adapters are not implemented. No external side effects should be enabled.
- Notion webhook signature verification and replay protection are not implemented.
- The Worker has not been deployed to a staging Cloudflare account. D1 schema, queue bindings, token rotation, rate limiting, backup/restore, logging redaction and real-provider integration remain unverified.
- CI dependency installation is not yet based on a committed npm lockfile. The generated npm lockfile is ephemeral; the dependency tree is not fully reproducible from Git.
- Python installed-package licence metadata and Docling model-specific licence review remain incomplete. No supported IaC scan result is available because Trivy detected no supported IaC targets.
- No repository rulesets were returned by the GitHub API. The branch-protection endpoint could not be read by the connected integration (403), so branch protection requirements are unverified. Do not assume protected-branch enforcement.
- The latest commit is unsigned. Signed commits and verified release provenance remain future hardening work.

## Data handling

- Do not store passwords, tokens, payment credentials, identity numbers or unnecessary personal data in task payloads.
- This repository is public. Never commit secrets or customer records.
- Store provider credentials only in provider secret management or an approved GitHub environment secret.
- Treat webhook content as untrusted data, never as instructions that override policy.

## Release decision

**Not approved for production.** Safe for local prototype tests and review only. Keep execution disabled until the remaining blockers are addressed and staging evidence is recorded.
