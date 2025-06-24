#!/usr/bin/env bash

# Helper script to verify env vars, kill existing dev server, and restart in dev mode
# Usage: chmod +x scripts/dev-setup.sh && scripts/dev-setup.sh

# Required variables in .env.local
REQUIRED_VARS=(NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY)

# Ensure .env.local exists
if [ ! -f ".env.local" ]; then
  echo "Error: .env.local not found in project root."
  exit 1
fi

echo "Verifying required environment variables in .env.local..."
missing=false
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^$var=" .env.local; then
    echo "  - Missing $var"
    missing=true
  fi
done

if [ "$missing" = true ]; then
  echo "Please add the missing variables to .env.local and rerun this script."
  exit 1
fi

# Kill any process on ports 3000 or 3005
for port in 3000 3005; do
  pid=$(lsof -ti tcp:$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID $pid)..."
    kill $pid
  fi
done

# Start the Next.js dev server
echo "Starting Next.js in dev mode..."
npm run dev
