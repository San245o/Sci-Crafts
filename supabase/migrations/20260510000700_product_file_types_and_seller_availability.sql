-- Adds GLB/ZIP product file metadata and public, non-sensitive seller availability.

alter table public.products
add column if not exists model_file_type text,
add column if not exists model_file_name text;

update public.products
set model_file_type = 'glb'
where model_file_type is null;

alter table public.products
alter column model_file_type set default 'glb',
alter column model_file_type set not null;

alter table public.products
drop constraint if exists products_model_file_type_check;

alter table public.products
add constraint products_model_file_type_check
check (model_file_type in ('glb', 'zip'));

update storage.buckets
set allowed_mime_types = array[
  'model/gltf-binary',
  'application/octet-stream',
  'application/zip',
  'application/x-zip-compressed'
]
where id in ('product-models', 'product-models-raw');

create table if not exists public.seller_availability (
  id uuid primary key references public.profiles(id) on delete cascade,
  city text not null check (city in ('Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad')),
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  location text not null check (char_length(location) between 1 and 240),
  printers jsonb not null default '[]'::jsonb,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_availability_printers_array_check check (jsonb_typeof(printers) = 'array')
);

drop trigger if exists seller_availability_set_updated_at on public.seller_availability;
create trigger seller_availability_set_updated_at
before update on public.seller_availability
for each row execute function public.set_updated_at();

alter table public.seller_availability enable row level security;

drop policy if exists "Seller availability is public" on public.seller_availability;
create policy "Seller availability is public"
on public.seller_availability for select
to anon, authenticated
using (true);

drop policy if exists "Users create own seller availability" on public.seller_availability;
create policy "Users create own seller availability"
on public.seller_availability for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users update own seller availability" on public.seller_availability;
create policy "Users update own seller availability"
on public.seller_availability for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users delete own seller availability" on public.seller_availability;
create policy "Users delete own seller availability"
on public.seller_availability for delete
to authenticated
using (id = (select auth.uid()));

grant select on public.seller_availability to anon, authenticated;
grant insert, update, delete on public.seller_availability to authenticated;

insert into public.seller_availability (id, city, pincode, location, printers)
select
  seller_profile.id,
  seller_profile.city,
  seller_profile.pincode,
  seller_profile.location,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'printerModel', printer.value ->> 'printerModel',
          'materialRates', coalesce(printer.value -> 'materialRates', '[]'::jsonb)
        )
      )
      from jsonb_array_elements(seller_profile.printers) as printer(value)
    ),
    '[]'::jsonb
  ) as printers
from public.seller_profiles seller_profile
where seller_profile.city in ('Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad')
on conflict (id) do update set
  city = excluded.city,
  pincode = excluded.pincode,
  location = excluded.location,
  printers = excluded.printers;

create index if not exists seller_availability_city_rating_idx
on public.seller_availability(city, rating desc);
