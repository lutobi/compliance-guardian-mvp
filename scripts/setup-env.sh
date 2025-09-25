#!/usr/bin/env bash
# Generates .env.local template for AI provider keys without embedding secrets
# Usage: bash scripts/setup-env.sh

ENV_FILE=".env.local"

cat > $ENV_FILE <<EOF
# Choose AI provider: openai or deepseek
AI_PROVIDER=openai

# OpenAI API key (set your key here or export in shell before running dev)
# Example: export OPENAI_API_KEY=sk-... (do NOT commit real keys)
OPENAI_API_KEY=

# Deepseek API key (if using Deepseek)
DEEPSEEK_API_KEY=
EOF

echo "Created $ENV_FILE template. Please fill in your keys locally (do not commit)."
