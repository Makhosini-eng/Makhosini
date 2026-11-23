# CAPITAL KING POC: automation and security evaluation

**Branch:** `capital-king/poc-automation-security-2026-11`  
**Base:** `capital-king/system-upgrade-2026-11`  
**Latest audited commit:** `83a1376fd736b44d460a5dcd08445d39e3fd011b`  
**Scope:** development-only; synthetic records; localhost-only browser preview; no credentials, customer data, live account integrations, spending, publication or deployment.

## Workstream status

| Workstream | Current result | Evidence / limitation |
|---|---|---|
| Playwright | Integrated and verified | Latest Quality Gates run #102: 2 local browser tests passed. |
| Node / task engine | Verified | Latest run #102: 29 Node tests passed; syntax check passed. Includes streaming body-limit and concurrent-approval regression tests. |
| Python POCs | Verified | Latest run #102: 7 synthetic analytics/document-adapter tests passed. |
| Trivy vulnerabilities / misconfiguration | Blocking gate passed | Run #102 reported 0 HIGH/CRITICAL findings in the generated npm lockfile and direct Python requirements manifests. No supported IaC config files were detected. |
| Trivy secrets | Blocking gate passed | Dedicated repository secret-scan command completed with no findings reported; output does not provide a complete per-file clean inventory. |
| Trivy licences | Report-only; incomplete | pip licence metadata was skipped because no `site-packages` directory was found. Docling model-specific licences remain unreviewed. |
| Activepieces | Authenticated ingress client and contract added; runtime not connected | Client validates events, requires HTTPS and bearer auth, targets only `/events/task`, refuses redirects and does not retry automatically. No deployed endpoint, secret, database, queue or Activepieces runtime has been configured or tested. |
| Docling | Optional adapter and synthetic tests added; full parser not installed | MIT codebase, pinned 2.152.0. Models and their licences are separate; full PDF/model test is deferred due runtime and model-download cost. |
| pandas | Optional reporting utility integrated | Seven synthetic-data tests passed in the latest Python CI job with pandas 3.1.0. |

## Latest CI evidence

- Quality Gates run #102: https://github.com/Makhosini-eng/Makhosini/actions/runs/45291994524
- Commit: `83a1376fd736b44d460a5dcd08445d39e3fd011b`
- Node: 29 passed, 0 failed.
- Playwright: 2 passed.
- Python: 7 passed.
- Trivy HIGH/CRITICAL vulnerability and misconfiguration gate: passed.
- Trivy repository secret gate: passed with no findings reported.

## Playwright browser tests

- `@playwright/test` is pinned to `1.65.1` as a development-only dependency.
- `playwright.config.mjs` starts a local server bound only to `127.0.0.1`.
- `tests/browser/approval-preview-server.mjs` uses the real `src/core.mjs` task and approval functions. It accepts only two synthetic actions and has no send, publish, payment or deployment route.
- `tests/browser/approval-gate.spec.mjs` checks internal qualification and external-contact approval behaviour.
- This is not an end-to-end test of the small-business MVP; that application is not present in this repository.

## Trivy security baseline and limitations

The Quality Gates workflow installs Trivy `v0.76.2` through a pinned setup action commit. HIGH/CRITICAL vulnerability and misconfiguration findings now fail the workflow; a separate repository secret scan also fails on detected secrets. Licence inventory is report-only until full metadata coverage is available.

The latest scan reported no HIGH/CRITICAL vulnerabilities in the generated npm lockfile or direct Python requirements manifests. The secret scan completed successfully with no findings reported, but its output does not enumerate every scanned file as clean. The misconfiguration scanner detected no supported IaC configuration files, so no IaC assessment can be claimed. The pip licence scanner skipped package metadata because it did not find a `site-packages` directory; direct package/code licences are documented separately in `docs/THIRD_PARTY_NOTICES.md`. Docling model assets and model-specific licences were not installed or scanned.

The generated npm lockfile is ephemeral and not committed. Complete transitive lockfiles remain a pre-merge / pre-production task.

## Activepieces integration boundary

The proposed workflow is documented in `docs/ACTIVEPIECES_POC.md`; the authenticated hand-off contract is in `docs/ACTIVEPIECES_INTEGRATION_CONTRACT.md`. The task engine Worker source exposes an authenticated `POST /events/task` endpoint guarded by `INGEST_TOKEN`; the `src/adapters/activepieces-task-client.mjs` is the corresponding client. The adapter has no configured live endpoint or secret and has only been tested using a synthetic fetch stub. The Worker, database and queue have not been deployed or exercised together. Never expose an unauthenticated public webhook or store bearer secrets in flow exports or logs.

Task creation is not approval to execute an external action. Human approval remains a separate gate. No email, SMS, social publishing, payment, account-setting or deployment step is part of this flow.

## Docling boundary

The optional adapter in `tools/document_intelligence/` converts local documents to Markdown and refuses to overwrite existing output. It imports Docling lazily. Its tests use a fake converter, so they verify path/output safeguards, not the full model pipeline. Install only when needed using `requirements-docling.txt`; review model licences and resource use separately.

## pandas boundary

The optional reporting utility in `tools/analytics/` calculates monthly paid amounts, refunds and net amounts from a local CSV. It rejects duplicate IDs, malformed values and mixed currencies. It does not perform FX conversion, payment settlement reconciliation, tax calculation or accounting certification.

## Commands

### Node and browser checks

```sh
npm test
npm run check
npm install --ignore-scripts --no-audit --no-fund --package-lock=false
npx playwright install chromium
npm run test:browser
```

### Python POC tests

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-analytics.txt
python -m unittest discover -s tools -p 'test_*.py'
```

### Optional Docling conversion

```sh
python -m pip install -r requirements-docling.txt
python -m tools.document_intelligence.convert ./sample.pdf ./output/sample.md
```

### Manual Trivy scans

```sh
trivy fs --scanners vuln,misconfig --include-dev-deps --severity HIGH,CRITICAL --exit-code 1 .
trivy fs --scanners secret --exit-code 1 .
trivy fs --scanners license --include-dev-deps --exit-code 0 .
```

## Reproducibility and adoption gates

Direct package versions are pinned, but complete transitive lockfiles are not yet committed. Before production adoption, generate and review lockfiles and verify the full dependency tree. A tool is **tested** only after its acceptance criteria have been executed and evidence recorded. Integration or a configured CI job is not proof of a passing test.

No tool is approved for production deployment by this POC.
