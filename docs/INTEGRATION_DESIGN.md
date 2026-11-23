# Integration Design — Prepared, Not Connected

## Notion
Role: human-facing source of truth and approval review surface.

Proposed fields: Title, Task ID, Department, Status, Priority, Trigger/source, Event ID, Expected output, Approval required, Approval status, Evidence reference, Last run, Blocker/error.

The existing Notion ChatGPT connection is available for workspace work, but is not the same as a Cloudflare webhook integration credential. A separate least-privilege internal integration and database share are required for direct service-to-service access. Treat webhook notifications as hints and fetch the authoritative record before task creation. Provider-specific signature verification and replay protection are not implemented. If webhooks are unavailable, use one conservative reconciliation poll. Do not assume paid Notion database automation webhooks are available.

## GitHub
Role: code review, version history and CI.
- Repository: `Makhosini-eng/Makhosini` (public; `master` remains untouched by this POC).
- Use a feature branch and draft pull request.
- Never commit secrets, customer records or account exports.
- CI uses read-only contents permissions and has no deployment job or secret access.
- Quality Gates includes Node/browser/Python tests, blocking HIGH/CRITICAL vulnerability/misconfiguration scans and a blocking repository secret scan. Licence inventory is report-only while Python/model metadata coverage is incomplete.

## Cloudflare
Role: Worker ingress, D1 state ledger and Queues.
- No Cloudflare connector or verified account authorization is available.
- No Cloudflare resources have been created.
- Wrangler file is a template with placeholder database ID and safe execution defaults.
- Approval claim, conditional task transition and audit insertion are implemented using a D1 batch transaction, but this has only been tested with a synthetic database mock; no live D1 transaction has been run.
- Queue dispatch is not transactional with D1; an outbox/reconciliation pattern is required before execution.
- Secure account authorization is required for staging.

## ChatGPT scheduled workflows
Existing two automations remain unchanged. Proposed shifts are 08:00 Product, 15:00 Customer, 19:00 Operations (Africa/Johannesburg). Check task limits and overlap before adding anything. A schedule is not an always-on agent or direct API invocation from Cloudflare.

## Optional AI API
Not included or enabled. Requires model/provider, budget ceiling, retention policy and permitted payloads. Default API budget is zero.

## Metricool and Apollo
Metricool is for analytics/content preparation; publishing requires approval. Apollo is for research/qualification; outbound contact and paid-credit actions require approval. Neither is a core dependency.