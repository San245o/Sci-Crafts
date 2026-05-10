-- Adds buyer-seller conversations for marketplace product inquiries.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_buyer_seller_check check (buyer_id <> seller_id),
  constraint conversations_unique_thread unique (product_id, buyer_id, seller_id)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;

drop policy if exists "Conversation participants can read" on public.conversations;
create policy "Conversation participants can read"
on public.conversations for select
to authenticated
using (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
);

drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations"
on public.conversations for insert
to authenticated
with check (
  buyer_id = (select auth.uid())
  and seller_id <> (select auth.uid())
  and exists (
    select 1
    from public.products product
    where product.id = product_id
      and product.is_published = true
  )
  and exists (
    select 1
    from public.seller_availability seller
    where seller.id = seller_id
  )
);

drop policy if exists "Conversation participants can read messages" on public.conversation_messages;
create policy "Conversation participants can read messages"
on public.conversation_messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations conversation
    where conversation.id = conversation_id
      and (
        conversation.buyer_id = (select auth.uid())
        or conversation.seller_id = (select auth.uid())
      )
  )
);

drop policy if exists "Conversation participants can send messages" on public.conversation_messages;
create policy "Conversation participants can send messages"
on public.conversation_messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations conversation
    where conversation.id = conversation_id
      and (
        conversation.buyer_id = (select auth.uid())
        or conversation.seller_id = (select auth.uid())
      )
  )
);

grant select, insert on public.conversations to authenticated;
grant select, insert on public.conversation_messages to authenticated;

create index if not exists conversations_buyer_id_updated_at_idx
on public.conversations(buyer_id, updated_at desc);

create index if not exists conversations_seller_id_updated_at_idx
on public.conversations(seller_id, updated_at desc);

create index if not exists conversation_messages_conversation_id_created_at_idx
on public.conversation_messages(conversation_id, created_at asc);
