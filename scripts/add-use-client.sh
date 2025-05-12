#!/usr/bin/env bash
set -e

declare -a files=(
  "src/app/dashboard/frameworks/[slug]/page.tsx"
  "src/components/assessments/AssessmentClient.tsx"
)

for file in "${files[@]}"; do
  if ! grep -q "^'use client';" "$file"; then
    echo "Adding 'use client' to $file"
    # Prepend the directive at the very top
    sed -i '' "1s|^|'use client';\n|" "$file"
  else
    echo "$file already has 'use client'; skipping"
  fi
done
