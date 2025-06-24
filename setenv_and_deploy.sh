#!/usr/bin/env bash
set -e

echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<EOF
https://nrfpsbbkynykubcaarpg.supabase.co
EOF || true

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE3OTgsImV4cCI6MjA2MjY2Nzc5OH0.vRMYpGwZ7URyRkEUBERNeCkdcEX-BoTNAX5NDUkeU1E
EOF || true

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTc5OCwiZXhwIjoyMDYyNjY3Nzk4fQ.CsnQzzrLrxBV3RmON9ZYEOXJxchmCFSWsF648WVYQKg
EOF || true

echo "Deploying..."
npx vercel --prod
