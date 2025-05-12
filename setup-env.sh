#!/usr/bin/env bash

# Script to generate .env.local with Supabase credentials
cat <<EOF > .env.local
NEXT_PUBLIC_SUPABASE_URL=https://nrfpsbbkynykubcaarpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMzA0MjMsImV4cCI6MjA0NzgwNjQyM30.OkcS6Q-4fGKwpAoYfG3UTjK4UDQEisXTT-YSq1Ny_kE
EOF

echo ".env.local created with Supabase credentials"
