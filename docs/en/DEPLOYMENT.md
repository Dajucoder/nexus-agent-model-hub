# Deployment Guide

## Local Docker Compose

```bash
# Optional: copy for custom secrets or port overrides
cp .env.example .env
docker compose up --build
```

If you skip the copy step, Docker Compose still starts with the documented default values.

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Cross-Platform Notes

### Windows

- Use Docker Desktop with WSL2 enabled.
- Ensure ports `3000`, `4000`, `5432`, and `6379` are free.
- Line endings should remain LF. Use the repository `.gitattributes` if you add one later.

### macOS

- Docker Desktop or OrbStack both work.
- Apple Silicon is supported through multi-arch base images.

### Linux

- Docker Engine 24+ and Compose Plugin 2.20+ recommended.
- Add the current user to the `docker` group if you do not want `sudo`.

## Cloud Deployments

### AWS

- Run frontend and backend on ECS Fargate or EKS.
- Use RDS PostgreSQL and ElastiCache Redis.
- Terminate TLS at ALB or ingress controller.

### GCP

- Run on Cloud Run for small-scale environments or GKE for full control.
- Use Cloud SQL and Memorystore.

### Azure

- Run on Container Apps, AKS, or App Service for Containers.
- Use Azure Database for PostgreSQL and Azure Cache for Redis.

## Kubernetes

- Raw manifests live in `k8s/`
- Helm chart lives in `helm/nexus-agent-model-hub/`
- Replace placeholder secrets before production deployment

## Production Hardening

- Use managed Postgres and Redis
- Move secrets to a secret manager
- Enable image signing and SBOM generation
- Put the API behind TLS and a WAF
- Use HTTP-only secure cookies or a BFF pattern for browser sessions if you productize this beyond the demo UI
