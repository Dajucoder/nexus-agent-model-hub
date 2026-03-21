#!/usr/bin/env sh
set -eu

target="${1:-docker}"

echo "Preparing deployment for merged root project..."
echo "Target: ${target}"

npm run typecheck
npm run test
npm run build

case "$target" in
  docker)
    docker compose up --build -d
    echo "Docker deployment started."
    ;;
  vercel)
    echo "This monorepo can deploy the frontend to Vercel, but the backend still needs a container or managed runtime."
    echo "Recommended approach:"
    echo "1. Deploy packages/frontend to Vercel"
    echo "2. Deploy packages/backend to a container platform"
    echo "3. Point NEXT_PUBLIC_API_URL to the public backend URL"
    ;;
  kubernetes)
    echo "Use the manifests in ./k8s or the Helm chart in ./helm/nexus-agent-model-hub."
    ;;
  *)
    echo "Unsupported target: $target"
    echo "Supported targets: docker, vercel, kubernetes"
    exit 1
    ;;
esac
