#!/usr/bin/env bash
set -euo pipefail

# Orchestrates the onboarding E2E locally
# - Installs deps (npm ci if lockfile exists)
# - Starts Next.js on PORT (default 3000)
# - Waits for readiness by probing /api/auth/callback (2xx/3xx)
# - Seeds the test user
# - Runs the Puppeteer onboarding E2E script
# - Cleans up the dev server on exit

PORT="${PORT:-3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR%/scripts}"
LOG_FILE="${SCRIPT_DIR}/.e2e-dev.log"

cd "${APP_DIR}"

echo "[run-e2e] App dir: ${APP_DIR}"
echo "[run-e2e] Using PORT=${PORT}"

echo "[run-e2e] Loading env from .env and .env.local (if present)..."
set -a
[ -f .env ] && source .env
[ -f .env.local ] && source .env.local
set +a

echo "[run-e2e] Checking required environment variables..."
if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" || -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "[run-e2e] Missing required env vars. Ensure they are set in .env.local or your shell:"
  echo "             - NEXT_PUBLIC_SUPABASE_URL"
  echo "             - SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# 1) Install dependencies (handle peer dep conflicts)
if [[ -f package-lock.json ]]; then
  echo "[run-e2e] Installing dependencies with npm ci (legacy peer deps)..."
  if ! npm ci --legacy-peer-deps; then
    echo "[run-e2e] npm ci failed, retrying with npm install (legacy peer deps)..."
    npm install --legacy-peer-deps
  fi
else
  echo "[run-e2e] Installing dependencies with npm install (legacy peer deps)..."
  npm install --legacy-peer-deps
fi

# 2) Start dev server
echo "[run-e2e] Starting Next.js dev server on port ${PORT}..."
# Ensure log file exists
: > "${LOG_FILE}"

# Start server in background, capture PID, and ensure cleanup (use local next binary)
node ./node_modules/.bin/next dev -p "${PORT}" >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!
trap 'echo "[run-e2e] Shutting down dev server (${SERVER_PID})"; kill ${SERVER_PID} >/dev/null 2>&1 || true' EXIT

# 3) Wait for readiness (2xx/3xx on /api/auth/callback)
READY=0
for i in {1..90}; do
  if STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/api/auth/callback" || true); then
    if [[ "$STATUS" =~ ^2|3 ]]; then
      READY=1
      break
    fi
  fi
  sleep 1
  if (( i % 10 == 0 )); then
    echo "[run-e2e] Waiting for server... (${i}s)"
  fi
done

if [[ "$READY" -ne 1 ]]; then
  echo "[run-e2e] Server did not become ready in time. Tail of dev log:" >&2
  tail -n 200 "${LOG_FILE}" >&2 || true
  exit 1
fi

echo "[run-e2e] Server is ready."

# 4) Seed the test user (idempotent)
if [[ -f "scripts/seed-test-user.js" ]]; then
  echo "[run-e2e] Seeding/verifying test user..."
  node scripts/seed-test-user.js || true
else
  echo "[run-e2e] seed-test-user.js not found; skipping seeding."
fi

# 5) Run the onboarding E2E test
echo "[run-e2e] Running onboarding E2E (scripts/test-onboarding-flow-v71.js)..."
if node scripts/test-onboarding-flow-v71.js; then
  echo "[run-e2e] ✅ Onboarding E2E passed."
else
  CODE=$?
  echo "[run-e2e] ❌ Onboarding E2E failed with code ${CODE}. Tail of dev log:" >&2
  tail -n 200 "${LOG_FILE}" >&2 || true
  exit ${CODE}
fi
