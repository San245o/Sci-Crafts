-- Keeps conversation ordering fresh when a participant sends a message.

grant update (updated_at) on public.conversations to authenticated;

drop policy if exists "Conversation participants can update timestamp" on public.conversations;
create policy "Conversation participants can update timestamp"
on public.conversations for update
to authenticated
using (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
)
with check (
  buyer_id = (select auth.uid())
  or seller_id = (select auth.uid())
);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists conversation_messages_touch_conversation on public.conversation_messages;
create trigger conversation_messages_touch_conversation
after insert on public.conversation_messages
for each row execute function public.touch_conversation_updated_at();
