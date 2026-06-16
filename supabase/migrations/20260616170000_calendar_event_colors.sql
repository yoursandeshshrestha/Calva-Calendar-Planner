-- Persistent per-event colors (assigned once, never changed on refresh)
create table public.calendar_event_colors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.connected_google_accounts(id) on delete cascade not null,
  google_event_id text not null,
  color text not null,
  created_at timestamptz not null default now(),
  unique (user_id, account_id, google_event_id)
);

alter table public.calendar_event_colors enable row level security;

create policy "No direct event color access"
  on public.calendar_event_colors
  for all
  to authenticated
  using (false);

create index calendar_event_colors_user_id_idx on public.calendar_event_colors (user_id);
