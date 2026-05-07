-- Adds asynchronous GLB optimization support.
-- Raw uploads go into product-models-raw and are deleted by the external worker after successful optimization.

alter table public.products
add column if not exists raw_model_path text,
add column if not exists optimized_model_path text,
add column if not exists original_size_bytes integer check (original_size_bytes is null or original_size_bytes <= 15728640),
add column if not exists optimized_size_bytes integer check (optimized_size_bytes is null or optimized_size_bytes <= 15728640),
add column if not exists optimization_status text not null default 'complete',
add column if not exists optimization_error text,
add column if not exists optimization_attempts integer not null default 0,
add column if not exists optimization_locked_at timestamptz,
add column if not exists optimized_at timestamptz;

alter table public.products
drop constraint if exists products_optimization_status_check;

alter table public.products
add constraint products_optimization_status_check
check (optimization_status in ('pending', 'processing', 'complete', 'failed'));

update public.products
set
  optimized_model_path = coalesce(optimized_model_path, model_path),
  optimized_size_bytes = coalesce(optimized_size_bytes, model_size_bytes),
  original_size_bytes = coalesce(original_size_bytes, model_size_bytes),
  optimization_status = case
    when model_path is null then 'pending'
    else optimization_status
  end
where optimized_model_path is null
   or optimized_size_bytes is null
   or original_size_bytes is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-models-raw', 'product-models-raw', false, 15728640, array['model/gltf-binary', 'application/octet-stream'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own raw product models" on storage.objects;
create policy "Users upload own raw product models"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-models-raw'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users read own raw product models" on storage.objects;
create policy "Users read own raw product models"
on storage.objects for select
to authenticated
using (
  bucket_id = 'product-models-raw'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own raw product models" on storage.objects;
create policy "Users delete own raw product models"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-models-raw'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.claim_model_optimization_job(
  max_attempts integer,
  stale_before timestamptz
)
returns setof public.products
language plpgsql
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
