#!/usr/bin/env sh
set -eu

cp -n .env.example .env || true
npm install
npm run db:generate

echo "Bootstrap complete."
echo "Next:"
echo "1. Start PostgreSQL and Redis"
echo "2. Run npm run db:migrate"
echo "3. Run npm run db:seed"
echo "4. Run npm run dev:backend and npm run dev:frontend"
