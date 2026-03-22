#!/usr/bin/env sh
set -eu

cp -n .env.example .env || true
npm install
npm run db:generate

echo "Bootstrap complete."
echo "Next:"
echo "1. Start PostgreSQL and Redis with: docker compose up -d postgres redis"
echo "2. Run npm run db:migrate"
echo "3. Run npm run db:seed"
echo "4. Start the backend with: npm run dev:backend"
echo "5. Start the frontend with: npm run dev:frontend"
echo "6. Validate the stack with: ./scripts/check.sh"
