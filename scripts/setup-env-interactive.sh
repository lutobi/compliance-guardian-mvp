#!/usr/bin/env bash

# Interactive script to generate .env.local with Supabase credentials
# Usage: chmod +x scripts/setup-env-interactive.sh && scripts/setup-env-interactive.sh

echo "Setting up .env.local for Compliance Guardian..."

read -p "Supabase URL (NEXT_PUBLIC_SUPABASE_URL): " SUPABASE_URL
read -p "Supabase ANON KEY (NEXT_PUBLIC_SUPABASE_ANON_KEY): " NEXT_PUBLIC_SUPABASE_ANON_KEY
read -p "Supabase SERVICE ROLE KEY (SUPABASE_SERVICE_ROLE_KEY): " SUPABASE_SERVICE_ROLE_KEY

cat <<EOF > .env.local
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
EOF

echo ".env.local created successfully with your Supabase credentials"
