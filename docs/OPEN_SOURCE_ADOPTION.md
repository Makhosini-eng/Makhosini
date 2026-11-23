# CAPITAL KING Open-Source Adoption Plan

Status: selected packages are integrated into isolated development POCs; no third-party source has been copied wholesale, no production service has been deployed, and no live account has been connected.

## Selection rules

Every candidate must pass:
1. A current maintenance check (recent releases/commits and responsive issue handling).
2. License verification against the repository's actual LICENSE file and dependency tree.
3. Security review (known advisories, install scripts, permissions, secrets handling).
4. Free-tier and self-hosting cost review, including hosting, storage, execution, and maintenance.
5. A small isolated proof of concept with measurable acceptance tests.
6. Human approval before adding runtime dependencies, deploying, or connecting production accounts.

## Candidates and current decisions

| Capability | Candidate | Intended use | Current decision |
|---|---|---|---|
| Workflow orchestration | https://github.com/n8n-io/n8n | Event routing, business workflows and integrations | Evaluate licence, hosting and operating cost before adoption |
| Alternative workflow automation | https://github.com/activepieces/activepieces | Compare connector coverage and self-hosting requirements | Integration contract and authenticated client POC prepared; runtime deferred |
| Browser automation | https://github.com/microsoft/playwright | Deterministic browser tests and approved repetitive workflows | Development dependency integrated; 2 local browser tests passed in Quality Gates run #102 |
| AI browser agent | https://github.com/browser-use/browser-use | Research and assisted browser tasks in a sandbox | Experimental; model and browser runtime may cost money |
| Document intelligence | https://github.com/docling-project/docling | Local PDF and Office document parsing | Optional adapter integrated and mocked tests passed; real model conversion deferred |
| Data analysis | https://github.com/pandas-dev/pandas | CSV, revenue reporting and reconciliation | Optional analytics POC integrated; 7 synthetic tests passed |
| Security scanning | https://github.com/aquasecurity/trivy | Filesystem, dependency, secret and licence scanning | Blocking HIGH/CRITICAL vulnerability/misconfiguration and secret checks passed in Quality Gates run #102; licence inventory incomplete |

Repository popularity is not proof of security, quality, legal suitability, or production fitness. Verify the current license, transitive dependencies, security advisories, release cadence and hosting economics before adoption.

## Target architecture

- Control plane: the existing task engine, explicit action catalogue, approval records and audit trail.
- Workflow plane: select one orchestrator only after a proof of concept; keep business logic in version-controlled, testable modules.
- Browser plane: Playwright for deterministic tests; isolate AI-driven browser sessions and prohibit credential exposure.
- Data plane: D1 schema is a prototype. Atomic approval state transition has been implemented in code but only tested with a mock; require a durable queue outbox/reconciliation pattern before staging.
- Integration plane: use official APIs/connectors with least-privilege credentials; never scrape around access controls.
- Observability: structured request IDs, redacted logs, failure alerts, cost ceilings and run reports.

## Phased implementation

1. Keep CI action pins, dependency update visibility and blocking security checks current.
2. Generate and review committed transitive dependency lockfiles.
3. Validate approval transactions against disposable D1 and implement queue outbox/reconciliation.
4. Add provider-specific webhook authentication and replay protection.
5. Prototype one workflow orchestrator using synthetic data.
6. Add deterministic browser tests and sandboxed agent experiments.
7. Connect one approved integration at a time.
8. Stage only after separate provider authorization and a verified cost check.

## Explicit exclusions

No autonomous trading, spending, purchases, external messages, public publishing, account-setting changes, production deployments, or destructive data operations. Each requires a separate exact-scope approval. Execution remains disabled until the security blockers are closed.
