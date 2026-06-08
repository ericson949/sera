create table if not exists public.ai_generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  action text not null check (action in ('generate', 'swap')),
  provider text not null,
  model text,
  status text not null check (status in ('started', 'success', 'fallback', 'error', 'rate_limited')),
  latency_ms integer,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists ai_generation_events_user_created_idx
  on public.ai_generation_events (user_id, created_at desc);

alter table public.ai_generation_events enable row level security;

drop policy if exists "Service role manages ai events" on public.ai_generation_events;
create policy "Service role manages ai events"
  on public.ai_generation_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
