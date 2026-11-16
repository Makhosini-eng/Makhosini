# CAPITAL KING AI Automation

A free-first, security-conscious foundation for building and operating the CAPITAL KING AI automation business.

## Project principles
- Start with free tiers and local testing; do not incur costs without explicit approval.
- Keep credentials out of Git. Use environment variables and a secrets manager only when a service is approved.
- Prefer least-privilege access, human approval for consequential actions, and auditable logs.
- Verify every workflow before enabling schedules, publishing, messaging, purchases, or external submissions.
- Never promise guaranteed earnings. Track validated revenue separately from projections.

## Current status
This repository is a starter foundation. No production integrations, credentials, scheduled jobs, or paid services have been configured.

## Documentation
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Setup and safe testing](docs/SETUP.md)
- [Security policy](SECURITY.md)

## Initial architecture
1. Control layer: task intake, priorities, approval gates, and run history.
2. Automation layer: small, testable workflows with explicit inputs and outputs.
3. Integration layer: approved APIs/connectors; credentials injected at runtime, never stored in source.
4. Delivery layer: reports, drafts, content, and customer-ready outputs.
5. Monitoring layer: failures, retries, cost limits, and audit events.

## Non-goals for the starter phase
- No autonomous spending, trading, account creation, or irreversible actions.
- No unattended public posting or customer outreach.
- No collection or storage of passwords, banking credentials, or unnecessary personal data.
