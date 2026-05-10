-- Creates the MVP marketplace products table and storage policies.
-- Product images are public for fast catalog rendering. Product models stay private
-- and the app creates short-lived signed URLs for model previews/downloads.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  category text not null check (char_length(category) between 1 and 80),
  image_paths text[] not null default '{}',
  model_path text,
  model_size_bytes integer check (model_size_bytes is null or model_size_bytes <= 15728640),
  is_published boolean not null default true,
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

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Published products are visible" on public.products;
create policy "Published products are visible"
on public.products for select
to anon, authenticated
using (is_published = true or owner_id = auth.uid());

drop policy if exists "Authenticated users create products" on public.products;
create policy "Authenticated users create products"
on public.products for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles profile
    join public.seller_profiles seller_profile on seller_profile.id = profile.id
    where profile.id = auth.uid()
      and profile.account_type = 'seller'
  )
);

drop policy if exists "Owners update products" on public.products;
create policy "Owners update products"
on public.products for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners delete products" on public.products;
create policy "Owners delete products"
on public.products for delete
to authenticated
using (owner_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-models', 'product-models', false, 15728640, array['model/gltf-binary', 'application/octet-stream'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Product images are served through public storage URLs.
drop policy if exists "Published product images can be signed" on storage.objects;

drop policy if exists "Published product models can be signed" on storage.objects;
create policy "Published product models can be signed"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'product-models'
  and exists (
    select 1
    from public.products p
    where p.is_published = true
      and p.model_path = name
  )
);

drop policy if exists "Users upload own product images" on storage.objects;
create policy "Users upload own product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users upload own product models" on storage.objects;
create policy "Users upload own product models"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-models'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own product files" on storage.objects;
create policy "Users update own product files"
on storage.objects for update
to authenticated
using (
  bucket_id in ('product-images', 'product-models')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('product-images', 'product-models')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own product files" on storage.objects;
create policy "Users delete own product files"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('product-images', 'product-models')
  and (storage.foldername(name))[1] = auth.uid()::text
);
