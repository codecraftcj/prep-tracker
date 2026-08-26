-- prep-tracker: the whole app state is one JSON document. Run once in the Supabase SQL editor.
create table if not exists public.app_state (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
-- The server uses the service-role key, which bypasses RLS. Enable RLS anyway so the
-- anon key (which is public) can never read or write this table.
alter table public.app_state enable row level security;
