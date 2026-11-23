# CAPITAL KING POC: automation and security evaluation

**Branch:** `capital-king/poc-automation-security-2026-11`  
**Base:** `capital-king/system-upgrade-2026-11`  
**Scope:** development-only; synthetic records; localhost-only browser preview; no credentials, customer data, live account integrations, spending, publication or deployment.

## What this POC contains

This repository has a small Node.js task engine and built-in test runner. The POC now adds a pinned Playwright browser-test harness around the existing task-approval policy.

- `fixtures/synthetic-leads.json` contains three fabricated leads using the reserved `example.test` domain.
- `tests/poc-automation.test.mjs` checks that lead qualification creates internal tasks only and external contact requires explicit approval.
- `@playwright/test` is pinned to version `1.65.1` as a development-only dependency.
- `playwright.config.mjs` starts a local test server bound only to `127.0.0.1`.
- `tests/browser/approval-preview-server.mjs` uses the real `src/core.mjs` task and approval functions. It accepts only two synthetic actions and has no send, publish, payment, or deployment route.
- `tests/browser/approval-gate.spec.mjs` checks the browser-visible state for internal qualification and blocked external contact.
- `docs/THIRD_PARTY_NOTICES.md` records the upstream project, exact package version and Apache-2.0 attribution.

This is a browser policy-preview harness, not an end-to-end test of the CAPITAL KING small-business MVP. That application is not present in this repository, so no real product UI or production URL is assumed.

## Evaluation gates

| Candidate | Safe experiment | Acceptance criteria | Current status |
|---|---|---|---|
| Microsoft Playwright | Local browser tests against the policy preview server and existing task engine | Internal task remains internal; external contact stays awaiting approval; no external side effects | Integrated; execution not yet verified by CI |
| Activepieces Community Edition | Rebuild the lead qualification flow in an isolated local instance using only the synthetic fixture | No real email/SMS connectors; idempotent event handling; clear failure/retry log; zero external side effects; Community Edition licence verified | Not run — isolated instance/runtime not available |
| Aqua Security Trivy | Run filesystem scan against this branch in an isolated runner; inspect vulnerability, secret, misconfiguration and licence findings | Review findings; verify no real secrets; no automatic dependency upgrades | Not run — scanner not installed and no pinned action has been reviewed |

## Commands

### Existing project checks

```sh
npm test
npm run check
```

### Playwright browser checks

```sh
npm install --ignore-scripts --no-audit --no-fund --package-lock=false
npx playwright install chromium
npm run test:browser
```

The GitHub Actions quality-gates workflow installs the pinned development dependency, installs Chromium, and runs unit tests, syntax checks and browser tests. The workflow has read-only repository permissions and no deployment or external-action steps.

**Reproducibility note:** the direct Playwright package version is exact, but this POC does not yet commit a `package-lock.json`; CI deliberately disables lockfile generation. Generate and review a lockfile before adopting this dependency beyond the isolated POC.

### Trivy (manual, isolated runner only)

```sh
trivy fs --scanners vuln,misconfig,secret,license --format json --output trivy-report.json .
```

Do not commit scan output if it contains paths, secret evidence or other sensitive metadata. Review findings before sharing.

### Activepieces

Use only the MIT Community Edition features for this evaluation. Do not expose the instance publicly, connect live mail/payment/social accounts, import real contacts, or enable outbound actions. Compare its retry, deduplication and audit behaviour with the existing task engine before any adoption decision.

## Licence and dependency handling

Playwright is consumed as a pinned package dependency; upstream implementation files have not been copied into CAPITAL KING or relicensed. See `docs/THIRD_PARTY_NOTICES.md`. Re-check package and transitive dependency licences, security advisories and release compatibility before upgrading.

## Decision rule

A tool is **tested** only after its acceptance criteria have been executed and evidence recorded. Integration is not proof of a passing test. Playwright remains **integrated, pending CI verification**; Activepieces and Trivy remain **not run**. No tool is approved for production deployment by this POC.
