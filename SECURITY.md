# Security Policy

## Scope
This repository is a public starter project. Treat all committed content as public.

## Never commit
- Passwords, API keys, access tokens, OAuth refresh tokens, private keys, recovery codes.
- Bank details, identity documents, private customer information, or confidential business records.
- Real environment files or credential exports.

## Required controls
- Use least-privilege tokens and restrict repository/workflow permissions.
- Store approved runtime secrets in the platform's encrypted secret store.
- Use placeholders in examples (for example, YOUR_API_TOKEN).
- Require human review before external messages, publishing, purchases, account changes, or financial actions.
- Pin third-party CI actions to verified full commit SHAs before adding them.
- Review dependencies and workflow changes before enabling automation.

## If a secret is exposed
1. Revoke or rotate it immediately at the issuing provider.
2. Review access logs and affected accounts.
3. Remove the secret from repository history where appropriate; deleting a file alone does not invalidate a leaked credential.
4. Document the incident without reproducing the secret.

## Reporting
Do not publish exploit details or secrets in issues. Contact the repository owner privately through GitHub's available security-reporting channel.
