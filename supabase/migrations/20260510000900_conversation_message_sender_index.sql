-- Adds a covering index for the conversation message sender foreign key.

create index if not exists conversation_messages_sender_id_idx
on public.conversation_messages(sender_id);
