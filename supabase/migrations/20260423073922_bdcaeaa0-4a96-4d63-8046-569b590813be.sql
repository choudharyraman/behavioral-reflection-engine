
create table public.copilot_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  salary numeric,
  savings_goal numeric,
  preferences jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.copilot_preferences enable row level security;

create policy "Users view own copilot prefs"
  on public.copilot_preferences for select
  using (auth.uid() = user_id);

create policy "Users insert own copilot prefs"
  on public.copilot_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users update own copilot prefs"
  on public.copilot_preferences for update
  using (auth.uid() = user_id);

create policy "Users delete own copilot prefs"
  on public.copilot_preferences for delete
  using (auth.uid() = user_id);

create trigger copilot_preferences_updated_at
  before update on public.copilot_preferences
  for each row execute function public.update_updated_at_column();
