#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.silentengine"
SCHEMA_FILE="supabase/silentengine_schema.sql"

missing=()
for file in "$ENV_FILE" "$SCHEMA_FILE"; do
  if [ ! -f "$file" ]; then
    missing+=("$file")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "❌ Missing required file(s): ${missing[*]}" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

required_vars=(
  ENGINE_API_KEY
  ALLOWED_ORIGINS
  NODE_ENV
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  GOOGLE_API_KEY
  GROQ_API_KEY
  OPENROUTER_API_KEY
  HASH_PROMPTS
  LOG_RETENTION_DAYS
  PORT
  APP_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  STRIPE_SECRET_KEY
  NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
  NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
)

invalid=()
for var in "${required_vars[@]}"; do
  value=${!var-}
  if [ -z "${value:-}" ] || [[ $value == placeholder_* ]]; then
    invalid+=("$var")
  fi
done

if [ ${#invalid[@]} -gt 0 ]; then
  echo "❌ Update $ENV_FILE: missing or placeholder values for ${invalid[*]}" >&2
  exit 1
fi

echo "✅ Required files exist. Running npm build…"
npm run build
