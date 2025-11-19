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
