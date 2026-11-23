# CAPITAL KING POC: automation and security evaluation

**Branch:** `capital-king/poc-automation-security-2026-11`  
**Base:** `capital-king/system-upgrade-2026-11`  
**Scope:** development-only; synthetic records; no credentials, customer data, network integrations, spending, publication or deployment.

## What this first pass proves

This repository currently has a small Node.js task engine and built-in test runner. It does not contain a deployable Activepieces instance, a browser-test target for Playwright, or an installed Trivy binary. The first safe step is therefore to establish a repeatable synthetic lead scenario against the existing task engine before evaluating external tools.

- `fixtures/synthetic-leads.json` contains three fabricated leads using the reserved `example.test` domain.
- `tests/poc-automation.test.mjs` checks that lead qualification creates internal tasks only.
- The test also verifies that an external-contact action is held for exact human approval by the existing policy engine.
- No third-party package or source code is added.

## Evaluation gates

| Candidate | Safe next experiment | Acceptance criteria | Current status |
|---|---|---|---|
| Activepieces Community Edition | Import/rebuild the lead qualification flow in an isolated local instance using only the synthetic fixture | No real email/SMS connectors; idempotent event handling; clear failure/retry log; zero external side effects; Community Edition licence verified | Not run — isolated instance/runtime not available in this repository |
| Microsoft Playwright | Add a browser test only after the small-business MVP URL/source and test credentials are identified; use local or disposable test environment | Critical form flows pass; no production account; no secrets in logs; deterministic assertions | Not run — no browser target or Playwright dependency in this repo |
| Aqua Security Trivy | Run filesystem scan against this branch in an isolated runner; inspect vulnerability, secret, misconfiguration and licence findings | Save machine-readable report; triage findings; verify no real secrets; no automatic dependency upgrades | Not run — scanner not installed and no pinned action has been reviewed |

## Commands after a disposable test environment is approved

### Existing project checks

```sh
npm test
npm run check
```

### Trivy (manual, isolated runner only)

```sh
trivy fs --scanners vuln,misconfig,secret,license --format json --output trivy-report.json .
```

Do not commit scan output if it contains paths, secret evidence or other sensitive metadata. Review findings before sharing.

### Playwright

Do not add Playwright to the product runtime. When the target application and isolated environment are confirmed, add it as a development-only test dependency and pin the version. The browser test must target a local/disposable URL and use synthetic records.

### Activepieces

Use only the MIT Community Edition features for this evaluation. Do not expose the instance publicly, connect live mail/payment/social accounts, import real contacts, or enable outbound actions. Compare its retry, deduplication and audit behaviour with the existing task engine before any adoption decision.

## Decision rule

A tool is **tested** only after its acceptance criteria have been executed and evidence recorded. Preparing this harness is not proof that Activepieces, Playwright or Trivy has passed. No candidate is adopted by this POC.