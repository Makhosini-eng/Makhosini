# Activepieces Community Edition: CAPITAL KING POC assessment

**Decision:** workflow design prepared; runtime installation deferred.  
**Scope:** synthetic lead records only; no live connectors, credentials, outbound messages or public webhooks.

## Licence and operating model

The Activepieces repository states that Community Edition code outside its Enterprise directories is MIT-licensed; Enterprise code under the Enterprise directories has a separate commercial licence. The exact files and pieces used must be checked at the pinned upstream revision before copying or distributing any code.

Official references:
- Repository and licence: https://github.com/activepieces/activepieces
- Root licence: https://github.com/activepieces/activepieces/blob/main/LICENSE
- Self-host installation: https://www.activepieces.com/docs/install/options/docker-compose

The documented Docker Compose self-host option requires Docker Compose v2 and at least 2 vCPU / 4 GB RAM. The standard setup uses application, worker, PostgreSQL and Redis containers. This is not a sensible background installation on a constrained Android device and is not started by this POC.

## Proposed safe flow

1. **Trigger:** manual test trigger or local-only webhook in a disposable instance. Do not expose a public webhook.
2. **Validate:** accept only the synthetic fixture schema; reject unknown fields and malformed email values.
3. **Deduplicate:** use the stable synthetic lead ID as the idempotency key.
4. **Qualify:** classify service category and completeness; do not infer consent.
5. **Create internal task:** send a task to a future authenticated private adapter for the existing CAPITAL KING task engine.
6. **Audit:** record the synthetic event ID, decision, timestamp and failure state.
7. **Stop:** no email, SMS, social message, payment, publishing or customer contact action exists in this flow.

## Integration boundary

The current repository's task engine is a Node.js module, not a deployed authenticated HTTP API. Therefore an Activepieces flow cannot safely call it yet. The next engineering dependency is a narrowly scoped internal adapter with authentication, schema validation, idempotency and an allow-listed action catalogue. Do not expose the task engine publicly to make this POC work.

## Acceptance checklist

- [ ] Isolated Activepieces Community Edition instance is available.
- [ ] Exact upstream version and licence paths are pinned and reviewed.
- [ ] Only synthetic fixture records are imported.
- [ ] No external service connections are configured.
- [ ] Duplicate events produce one internal task.
- [ ] Failed steps are observable and bounded for retry.
- [ ] Audit events contain no secrets or unnecessary personal data.
- [ ] Teardown and data deletion are verified.

## Current result

**Evaluated, not installed, not executed, not adopted.** The design is suitable for a future isolated test, but there is no evidence yet that an Activepieces flow has passed the acceptance criteria.
