# CAPITAL KING GitHub Resource Library

**Reviewed:** 2026-11-24  
**Status:** Curated evaluation catalogue — no third-party code installed or copied into this repository.  
**Home:** `docs/GITHUB_RESOURCE_LIBRARY.md`

This library is the first stop when a task can be accelerated by existing code. Search this catalogue, then search GitHub for task-specific alternatives before writing new code.

## Operating rule

Reuse reliable code when it is safer and cheaper than rebuilding. A public repository is not automatically safe, production-ready, free to host, or commercially unrestricted.

For every candidate:
1. Confirm the canonical repository and current default branch.
2. Read the root license and any subdirectory / dependency licenses that apply.
3. Inspect release cadence, recent commits, open security advisories, issue handling and maintainers.
4. Review install scripts, dependency tree, permissions, network access, telemetry and secret handling.
5. Estimate compute, hosting, storage, API and maintenance costs.
6. Test in an isolated sandbox with synthetic data.
7. Record a decision and evidence before adding it to a product.
8. Require explicit approval before adding runtime dependencies, connecting accounts, spending money, publishing, or deploying.

## Curated candidates

| Area | Repository | Licence stated by project | What it can accelerate | Initial decision |
|---|---|---|---|---|
| Workflow automation | [activepieces/activepieces](https://github.com/activepieces/activepieces) | MIT for Community Edition; enterprise features commercial | Event-driven workflows, integrations, AI workflows, lead and operations processes | **Priority POC**; scope features to MIT Community Edition |
| Deterministic browser automation | [microsoft/playwright](https://github.com/microsoft/playwright) | Apache-2.0 | Browser tests, repeatable web workflows, form and UI verification | **Preferred browser test foundation** |
| AI browser agent | [browser-use/browser-use](https://github.com/browser-use/browser-use) | MIT library; hosted services are separate | Assisted research and browser tasks using a model | **Sandbox only**; model and browser runtime may cost money |
| Document intelligence | [docling-project/docling](https://github.com/docling-project/docling) | MIT codebase; individual models have separate licences | PDF, Office and document parsing for research, proposals and knowledge extraction | **Priority POC** for document workflows |
| Data analysis | [pandas-dev/pandas](https://github.com/pandas-dev/pandas) | BSD-3-Clause | CSV / spreadsheet analysis, reporting, reconciliation and time-series work | **Approved candidate** for isolated data tasks |
| AI model framework | [huggingface/transformers](https://github.com/huggingface/transformers) | Apache-2.0 code; model licences vary | Text, vision, audio and multimodal model integration | **Evaluate per model**; never assume weights share the code licence |
| Security scanning | [aquasecurity/trivy](https://github.com/aquasecurity/trivy) | Apache-2.0 | Dependency, filesystem, container, IaC, secret and licence scanning | **Priority security POC** |
| Business ERP | [frappe/erpnext](https://github.com/frappe/erpnext) | GPL-3.0 | Accounting, CRM, inventory, projects, procurement and operations | **Evaluate as a standalone product**; copyleft obligations require legal review before integration or distribution |
| Application framework | [frappe/frappe](https://github.com/frappe/frappe) | MIT | Full-stack business application framework, APIs and data models | **Evaluate only if** building a Frappe-based application |
| Workflow automation (restricted licence) | [n8n-io/n8n](https://github.com/n8n-io/n8n) | Sustainable Use License / Enterprise License (fair-code; not OSI open source) | Workflow orchestration and integrations | **Conditional**; review use restrictions and enterprise-only code before any commercial deployment |

## Fit to CAPITAL KING work

| Recurring task | First tools to inspect |
|---|---|
| Build or modify an application | Existing project stack first; then Frappe or focused libraries |
| Automate repetitive business processes | Activepieces; compare alternatives before choosing one orchestrator |
| Test websites and user journeys | Playwright |
| Research and browser-assisted tasks | Browser Use in a sandbox; Playwright for deterministic steps |
| Read PDFs, proposals and funding documents | Docling |
| Analyse trading, business or sales datasets | pandas; validate calculations independently |
| Review code and dependencies for risk | Trivy; repository-native GitHub security features |
| Build CRM, accounting and operations systems | ERPNext / Frappe as a separate-system evaluation |
| Add AI model capabilities | Transformers; check each model's weights, terms and runtime costs |

## Adoption status definitions

- **Candidate:** relevant project; not yet tested.
- **POC approved:** isolated test may be prepared using synthetic data.
- **Tested:** proof of concept passed documented acceptance tests.
- **Adopted:** approved for a named project with pinned version and dependency review.
- **Rejected / deferred:** failed licence, security, maintenance, cost or fit checks.

No project in this first catalogue is marked adopted. The word "approved" in a candidate description is not production approval.

## Licensing and cost cautions

- MIT, Apache-2.0 and BSD-3-Clause are generally permissive, but notices, patent terms (Apache-2.0), attribution and third-party dependency licences still matter.
- GPL-3.0 and AGPL licences can impose source-sharing obligations in relevant distribution or network-use circumstances. Obtain a legal review before embedding, modifying or distributing covered software.
- n8n explicitly describes its licence as fair-code / source-available, not OSI open source. Its use restrictions matter for commercial products and hosted services.
- A free codebase can still require paid hosting, storage, API access, model inference, browser infrastructure or support.
- Model code, model weights, datasets, plugins and extensions can all have different terms.
- Never paste secrets, private customer records or production data into an unreviewed project.

## Next evaluation queue

1. Run a small Activepieces workflow comparison against the existing CAPITAL KING task engine using synthetic lead records.
2. Run Playwright against the existing small-business MVP in a local test environment.
3. Test Docling on non-sensitive sample PDFs and compare extracted text/tables against manual review.
4. Run Trivy against the development branch and review findings before changing dependencies.
5. Evaluate pandas for a repeatable sales / revenue reporting example.
6. Keep Browser Use isolated until credential handling, action boundaries and cost controls are tested.

## Maintenance

Update this catalogue when a repository is evaluated, rejected, adopted, or superseded. Record the checked commit or release, date, licence evidence, dependency scan, proof-of-concept result and maintainer. Re-check licences and security before each new adoption; this catalogue is not a permanent legal or security certification.

---
*This file is an evaluation guide, not a blanket authorization to install, execute, deploy, or connect any listed project.*
