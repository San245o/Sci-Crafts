-- Adds public marketplace profiles plus private seller verification profiles.
-- Public profiles expose display metadata only; seller serial/location/pricing data is owner-readable.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_url text,
  account_type text not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_account_type_check check (account_type in ('buyer', 'seller'))
);

alter table public.profiles
add column if not exists account_type text;

update public.profiles
set account_type = 'buyer'
where account_type is null;

alter table public.profiles
alter column account_type set default 'buyer',
alter column account_type set not null;

alter table public.profiles
drop constraint if exists profiles_account_type_check;

alter table public.profiles
add constraint profiles_account_type_check
check (account_type in ('buyer', 'seller'));

create table if not exists public.seller_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  city text not null check (char_length(city) between 1 and 120),
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  location text not null check (char_length(location) between 1 and 240),
  printers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_profiles_printers_array_check check (jsonb_typeof(printers) = 'array')
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

drop trigger if exists seller_profiles_set_updated_at on public.seller_profiles;
create trigger seller_profiles_set_updated_at
before update on public.seller_profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.seller_profiles enable row level security;

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

drop policy if exists "Users read own seller profile" on public.seller_profiles;
create policy "Users read own seller profile"
on public.seller_profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users create own seller profile" on public.seller_profiles;
create policy "Users create own seller profile"
on public.seller_profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users update own seller profile" on public.seller_profiles;
create policy "Users update own seller profile"
on public.seller_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users delete own seller profile" on public.seller_profiles;
create policy "Users delete own seller profile"
on public.seller_profiles for delete
to authenticated
using (id = auth.uid());

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.seller_profiles to authenticated;
