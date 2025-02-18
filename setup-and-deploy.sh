#!/bin/bash

# Create .env.local file
echo "Creating .env.local file..."
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://nrfpsbbkynykubcaarpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yZnBzYmJreW55a3ViY2FhcnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMzA0MjMsImV4cCI6MjA0NzgwNjQyM30.OkcS6Q-4fGKwpAoYfG3UTjK4UDQEisXTT-YSq1Ny_kE
EOL

# Build the project
echo "Building the project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel deploy --prod
