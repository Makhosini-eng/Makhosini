# CAPITAL KING POC: automation and security evaluation

**Branch:** `capital-king/poc-automation-security-2026-11`  
**Base:** `capital-king/system-upgrade-2026-11`  
**Scope:** development-only; synthetic records; localhost-only browser preview; no credentials, customer data, live account integrations, spending, publication or deployment.

## Workstream status

| Workstream | Current result | Evidence / limitation |
|---|---|---|
| Playwright | Integrated; CI verification pending | Localhost-only browser harness tests the actual approval policy. GitHub CI must run before claiming a pass. |
| Trivy | CI scanner configured; first baseline pending | Trivy v0.76.2 scans vulnerabilities, misconfiguration, secrets and licences. Initial scan is report-only pending triage. |
| Activepieces | Evaluated; design prepared; not installed or executed | Community Edition licence is MIT outside Enterprise paths. Self-host requires Docker Compose v2 and at least 2 vCPU / 4 GB RAM. No authenticated task API or suitable runtime is present here. |
| Docling | Optional adapter and synthetic tests added; full parser not installed | MIT codebase, pinned 2.152.0. Models and their licences are separate; full PDF/model test is deferred due runtime and model-download cost. |
| pandas | Optional reporting utility and synthetic tests added; local tests passed under pandas 2.2.3; pinned 3.1.0 CI pending | BSD-3-Clause, pinned 3.1.0. The local test runtime had pandas 2.2.3; this is not verification of the pinned CI version. |

## Playwright browser tests

- `@playwright/test` is pinned to `1.65.1` as a development-only dependency.
- `playwright.config.mjs` starts a local server bound only to `127.0.0.1`.
- `tests/browser/approval-preview-server.mjs` uses the real `src/core.mjs` task and approval functions. It accepts only two synthetic actions and has no send, publish, payment or deployment route.
- `tests/browser/approval-gate.spec.mjs` checks internal qualification and external-contact approval behaviour.
- This is not an end-to-end test of the small-business MVP; that application is not present in this repository.

## Trivy security baseline

The GitHub Actions workflow installs Trivy `v0.76.2` through a pinned setup action commit. It scans the repository for vulnerability, misconfiguration, secret and licence findings at HIGH and CRITICAL severity. The first baseline is report-only (`--exit-code 0`) so findings can be reviewed and triaged without blocking unrelated development. The scan job generates an ephemeral npm lockfile for dependency analysis and uses scanner-recognised `requirements.txt` manifests for the optional Python packages. The lockfile is not committed; generate and review a committed lockfile before production adoption. Do not convert the scan to a blocking gate until findings are reviewed.

## Activepieces boundary

The proposed flow is documented in `docs/ACTIVEPIECES_POC.md`. It accepts synthetic events, validates the schema, deduplicates on a stable event ID, creates an internal task through a future private adapter, and records an audit outcome. It has no outbound email/SMS/social action.

The current task engine is a Node.js module, not an authenticated HTTP API. Do not expose it publicly to connect Activepieces. A private authenticated adapter with idempotency and an allow-listed action catalogue is a prerequisite.

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

### Manual Trivy scan

```sh
trivy fs --scanners vuln,misconfig,secret,license --severity HIGH,CRITICAL --ignore-unfixed --format table .
```

## Reproducibility and adoption gates

Direct package versions are pinned, but complete transitive lockfiles are not yet committed. Before production adoption, generate and review lockfiles and verify the full dependency tree. A tool is **tested** only after its acceptance criteria have been executed and evidence recorded. Integration or a configured CI job is not proof of a passing test.

No tool is approved for production deployment by this POC.
