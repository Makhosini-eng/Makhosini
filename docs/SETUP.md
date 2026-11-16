# Setup and Safe Testing

## Current prerequisite
A GitHub account with access to this repository. The starter documentation requires no local installation.

## Local project setup (when application code is added)
1. Clone the repository.
2. Create a feature branch; do not work directly on master.
3. Read the workflow-specific README before running scripts.
4. Use a supported runtime version documented by the project.
5. Install only reviewed, pinned dependencies.
6. Copy an example configuration file to a local environment file only if one is provided.
7. Put dummy values in local test configuration. Never use production credentials in tests.
8. Run automated tests and inspect logs for accidental sensitive data.
9. Open a pull request and review the diff before merging.

## Free-first operating rules
- Do not enter payment details to activate a trial or free tier.
- Check quotas, inactivity/sleep limits, data retention, and commercial-use restrictions.
- Set usage limits where supported.
- Do not enable unattended schedules until manual runs are reliable.

## Safe test data
Use synthetic names, addresses, email addresses, transactions, and customer records. Do not copy real inbox messages, identity documents, or financial records into test fixtures.

## Approval boundary
A passing test does not authorize a workflow to send, publish, purchase, trade, submit forms, or modify external accounts. Those actions require explicit approval for the specific action.
