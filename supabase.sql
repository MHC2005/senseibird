create table if not exists public.user_stats (
  id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

create policy "Users can read their stats"
  on public.user_stats for select
  using (auth.uid() = id);

create policy "Users can upsert their stats"
  on public.user_stats for insert
  with check (auth.uid() = id);

create policy "Users can update their stats"
  on public.user_stats for update
  using (auth.uid() = id);
