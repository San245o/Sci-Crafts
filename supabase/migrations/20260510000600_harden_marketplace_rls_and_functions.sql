-- Hardens marketplace functions and improves RLS policy performance.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.claim_model_optimization_job(
  max_attempts integer,
  stale_before timestamptz
)
returns setof public.products
language plpgsql
set search_path = ''
as $$
begin
  return query
  with next_job as (
    select id
    from public.products
    where raw_model_path is not null
      and optimization_attempts < max_attempts
      and (
        optimization_status in ('pending', 'failed')
        or (
          optimization_status = 'processing'
          and optimization_locked_at < stale_before
        )
      )
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.products p
  set
    optimization_status = 'processing',
    optimization_locked_at = now(),
    optimization_attempts = p.optimization_attempts + 1,
    optimization_error = null
  from next_job
  where p.id = next_job.id
  returning p.*;
end;
$$;

revoke all on function public.claim_model_optimization_job(integer, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_model_optimization_job(integer, timestamptz) to service_role;

create index if not exists products_owner_id_idx on public.products(owner_id);

drop policy if exists "Published products are visible" on public.products;
create policy "Published products are visible"
on public.products for select
to anon, authenticated
using (is_published = true or owner_id = (select auth.uid()));

drop policy if exists "Authenticated users create products" on public.products;
create policy "Authenticated users create products"
on public.products for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles profile
    join public.seller_profiles seller_profile on seller_profile.id = profile.id
    where profile.id = (select auth.uid())
      and profile.account_type = 'seller'
  )
);

drop policy if exists "Owners update products" on public.products;
create policy "Owners update products"
on public.products for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners delete products" on public.products;
create policy "Owners delete products"
on public.products for delete
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Users create own profile" on public.profiles;
create policy "Users create own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users read own seller profile" on public.seller_profiles;
create policy "Users read own seller profile"
on public.seller_profiles for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Users create own seller profile" on public.seller_profiles;
create policy "Users create own seller profile"
on public.seller_profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users update own seller profile" on public.seller_profiles;
create policy "Users update own seller profile"
on public.seller_profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users delete own seller profile" on public.seller_profiles;
create policy "Users delete own seller profile"
on public.seller_profiles for delete
to authenticated
using (id = (select auth.uid()));
