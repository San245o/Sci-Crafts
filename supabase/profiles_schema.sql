-- Adds public seller profiles for marketplace display.
-- This does not expose auth.users. Only display metadata is public.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are publicly visible" on public.profiles;
create policy "Profiles are publicly visible"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
