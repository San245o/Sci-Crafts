-- Adds buyer product likes for saved marketplace models.

create table if not exists public.product_likes (
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

alter table public.product_likes enable row level security;

drop policy if exists "Users read own product likes" on public.product_likes;
create policy "Users read own product likes"
on public.product_likes for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users create own product likes" on public.product_likes;
create policy "Users create own product likes"
on public.product_likes for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.products product
    where product.id = product_id
      and product.is_published = true
  )
);

drop policy if exists "Users delete own product likes" on public.product_likes;
create policy "Users delete own product likes"
on public.product_likes for delete
to authenticated
using (user_id = (select auth.uid()));

grant select, insert, delete on public.product_likes to authenticated;

create index if not exists product_likes_user_id_created_at_idx
on public.product_likes(user_id, created_at desc);
