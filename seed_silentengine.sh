#!/usr/bin/env bash
set -euo pipefail

# Seed helper for SilentEngine local setup
ENV_FILE=".env.silentengine"
SCHEMA_DIR="supabase"
SCHEMA_FILE="$SCHEMA_DIR/silentengine_schema.sql"

if [ -e "$ENV_FILE" ]; then
  echo "ℹ️  $ENV_FILE already exists. Remove it if you want to recreate the template."
else
  cat <<'EOT' > "$ENV_FILE"
# SilentEngine environment template
# Replace every placeholder_* value with your real keys/IDs before running in production.
ENGINE_API_KEY=placeholder_engine_api_key
ALLOWED_ORIGINS=placeholder_allowed_origins
NODE_ENV=placeholder_node_env

OPENAI_API_KEY=placeholder_openai_api_key
ANTHROPIC_API_KEY=placeholder_anthropic_api_key
GOOGLE_API_KEY=placeholder_google_api_key
GROQ_API_KEY=placeholder_groq_api_key
OPENROUTER_API_KEY=placeholder_openrouter_api_key

HASH_PROMPTS=placeholder_hash_prompts_flag
LOG_RETENTION_DAYS=placeholder_log_retention_days
PORT=placeholder_port
APP_URL=placeholder_app_url

NEXT_PUBLIC_SUPABASE_URL=placeholder_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_supabase_anon_key

STRIPE_SECRET_KEY=placeholder_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=placeholder_monthly_price_id
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=placeholder_annual_price_id
EOT
  echo "✅ Created $ENV_FILE with placeholder values."
fi

mkdir -p "$SCHEMA_DIR"
if [ -e "$SCHEMA_FILE" ]; then
  echo "ℹ️  $SCHEMA_FILE already exists. Update it with your production schema as needed."
else
  cat <<'EOT' > "$SCHEMA_FILE"
-- SilentEngine Supabase schema template
-- Replace or extend this schema with your production-ready tables before applying it in Supabase.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists silentengine_request_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request jsonb not null,
  response jsonb,
  error text,
  fallback_used boolean not null default false
);

comment on table silentengine_request_logs is 'Application request/response logs for SilentEngine auditing.';
comment on column silentengine_request_logs.request is 'Redacted prompt/payload as stored by SilentEngine.';
comment on column silentengine_request_logs.response is 'Redacted model output as stored by SilentEngine.';

-- Add your own indexes/row-level security policies here before applying to Supabase.
EOT
  echo "✅ Created $SCHEMA_FILE template."
fi

printf "\nDone. Next steps:\n- Update %s with real secrets (keep it untracked).\n- Review %s before applying it in Supabase.\n" "$ENV_FILE" "$SCHEMA_FILE"
