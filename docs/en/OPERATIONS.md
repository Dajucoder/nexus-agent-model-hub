# Operations Guide

## Monitoring

- Health endpoint: `/api/v1/health`
- Suggested metrics:
  - request rate
  - request duration
  - auth failures
  - agent timeouts
  - per-tenant Agent concurrency

## Logs

- JSON logs in production
- Redacted fields include passwords, secrets, hashes, and auth headers
- Retention recommendation:
  - app logs: 30 days
  - audit logs: 180 days minimum
  - security events: 365 days if local policy requires it

## Backups

- Logical dumps at least every 6 hours for small installations
- Daily restore test into a staging environment
- WAL archiving or managed point-in-time recovery for production

## Incident Handling

- Disable a tenant by setting `Tenant.isActive = false`
- Revoke all refresh tokens for affected users
- Rotate API keys and JWT secrets if compromise is suspected

## Disaster Recovery Targets

- Suggested RPO: 15 minutes
- Suggested RTO: 2 hours
