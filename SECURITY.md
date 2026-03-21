# Security Policy

## Supported Scope

Security reports are especially valuable for:

- Authentication and session handling
- Tenant isolation failures
- Authorization bypasses
- Agent execution sandbox escapes
- Secret leakage
- Audit log tampering

## Reporting A Vulnerability

Do not open a public issue for a suspected security problem.

Instead:

1. Prepare a minimal reproduction.
2. Include affected version, impact, and suggested mitigation if known.
3. Send the report through the private maintainer channel for this repository.

If no dedicated channel has been set up yet, repository owners should add one before public launch.

## Disclosure Expectations

- We prefer coordinated disclosure.
- Please avoid publishing proof-of-concept exploit details before maintainers have had a reasonable chance to respond.
- Multi-tenant data exposure should be treated as critical severity.
