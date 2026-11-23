# Third-party notices

This file records direct optional/test dependencies. It does not replace the licence notices shipped by the upstream projects or a full transitive dependency audit.

## Microsoft Playwright

- Project: https://github.com/microsoft/playwright
- Integrated package: `@playwright/test`
- Pinned version: `1.65.1`
- Licence: Apache License 2.0
- Purpose: development-only browser testing; not part of the production runtime.
- Upstream implementation files are not copied or relicensed by CAPITAL KING.

## Docling

- Project: https://github.com/docling-project/docling
- Pinned optional package: `docling==2.152.0`
- Codebase licence: MIT
- Purpose: optional local document conversion to Markdown.
- Individual model packages and model weights can have separate licences. Review each model and dependency before using or distributing model assets. See `requirements-docling.txt`.

## pandas

- Project: https://github.com/pandas-dev/pandas
- Pinned optional package: `pandas==3.1.0`
- Licence: BSD-3-Clause
- Purpose: optional synthetic transaction and revenue reporting.
- pandas and its transitive dependencies retain their own notices. See `requirements-analytics.txt`.

## Aqua Security Trivy

- Project: https://github.com/aquasecurity/trivy
- Scanner version configured in CI: `v0.76.1`
- Licence: Apache License 2.0
- Installer action: https://github.com/aquasecurity/setup-trivy
- Installer action pinned to commit: `e07451d2e059ed86c2870430ea286b3a9e0bf241`
- Purpose: CI filesystem scan for vulnerabilities, misconfiguration, secrets and licence findings.
- Trivy is installed on the ephemeral GitHub Actions runner; it is not a product runtime dependency.

## Activepieces

- Project: https://github.com/activepieces/activepieces
- Community Edition code outside Enterprise directories: MIT
- Enterprise directories: separate commercial licence
- Status: evaluated and documented only; no code or service installed in this repository.
- Review the exact upstream paths and all piece/dependency licences before copying or distributing any source.

## Dependency update rule

Direct versions are pinned in the relevant requirements/package files. Transitive dependency resolution is not yet fully lockfile-reproducible for the optional Python or Node test environments. Before production adoption, generate and review lockfiles, verify checksums/provenance where available, and scan the complete dependency tree.
