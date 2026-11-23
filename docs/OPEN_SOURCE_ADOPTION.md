# CAPITAL KING Open-Source Adoption Plan

Status: evaluation plan only. No third-party code, package, container, or service has been installed by this change.

## Selection rules

Every candidate must pass:
1. A current maintenance check (recent releases/commits and responsive issue handling).
2. License verification against the repository's actual LICENSE file and dependency tree.
3. Security review (known advisories, install scripts, permissions, secrets handling).
4. Free-tier and self-hosting cost review, including hosting, storage, execution, and maintenance.
5. A small isolated proof of concept with measurable acceptance tests.
6. Human approval before adding runtime dependencies, deploying, or connecting production accounts.

## Candidates to evaluate

| Capability | Candidate | Intended use | Adoption decision |
|---|---|---|---|
| Workflow orchestration | https://github.com/n8n-io/n8n | Event routing, business workflows and integrations | Evaluate license, hosting and operating cost before adoption |
| Alternative workflow automation | https://github.com/activepieces/activepieces | Compare connector coverage and self-hosting requirements | Evaluate as an alternative; do not run two orchestration platforms initially |
| Browser automation | https://github.com/microsoft/playwright | Deterministic browser tests and approved repetitive workflows | Preferred technical candidate for test automation |
| AI browser agent | https://github.com/browser-use/browser-use | Research and assisted browser tasks in a sandbox | Experimental; human review required for consequential actions |

Repository popularity is not proof of security, quality, legal suitability, or production fitness. Verify the current license, transitive dependencies, security advisories, release cadence and hosting economics before adoption.

## Target architecture

- Control plane: the existing task engine, explicit action catalogue, approval records and audit trail.
- Workflow plane: select one orchestrator only after a proof of concept; keep business logic in version-controlled, testable modules.
- Browser plane: Playwright for deterministic tests; isolate AI-driven browser sessions and prohibit credential exposure.
- Data plane: existing D1 schema is a prototype; require transactional approval updates, queue outbox/reconciliation, retention rules and backups before staging.
- Integration plane: use official APIs/connectors with least-privilege credentials; never scrape around access controls.
- Observability: structured request IDs, redacted logs, failure alerts, cost ceilings and run reports.

## Phased implementation

1. Harden repository CI and dependency update visibility.
2. Validate the existing task engine locally; add missing failure-path tests.
3. Implement atomic approval persistence and queue outbox/reconciliation.
4. Add provider-specific webhook authentication and replay protection.
5. Prototype one workflow orchestrator using synthetic data.
6. Add deterministic browser tests and sandboxed agent experiments.
7. Connect one approved integration at a time.
8. Stage only after separate provider authorization and a verified cost check.

## Explicit exclusions

No autonomous trading, spending, purchases, external messages, public publishing, account-setting changes, production deployments, or destructive data operations. Each requires a separate exact-scope approval. Execution remains disabled until the security blockers are closed.
