-- Connected Google accounts (tokens stored server-side only)
create table public.connected_google_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  google_email text not null,
  google_name text,
  google_picture text,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_email)
);

-- OAuth state for linking additional Google accounts
create table public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  state text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.connected_google_accounts enable row level security;
alter table public.oauth_states enable row level security;

-- Users can delete their own connected accounts (tokens not readable from client)
create policy "Users can delete own connected accounts"
  on public.connected_google_accounts
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Safe read path without exposing OAuth tokens
create or replace function public.get_connected_accounts()
returns table (
  id uuid,
  user_id uuid,
  google_email text,
  google_name text,
  google_picture text,
  color text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.user_id,
    c.google_email,
    c.google_name,
    c.google_picture,
    c.color,
    c.created_at
  from public.connected_google_accounts c
  where c.user_id = auth.uid()
  order by c.created_at asc;
$$;

grant execute on function public.get_connected_accounts() to authenticated;

grant delete on public.connected_google_accounts to authenticated;

-- OAuth states: no direct client access (edge functions use service role)
create policy "No direct oauth state access"
  on public.oauth_states
  for all
  to authenticated
  using (false);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger connected_google_accounts_updated_at
  before update on public.connected_google_accounts
  for each row
  execute function public.set_updated_at();

-- Index for lookups
create index connected_google_accounts_user_id_idx on public.connected_google_accounts (user_id);
create index oauth_states_state_idx on public.oauth_states (state);
