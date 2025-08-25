-- 005_messaging_system.sql
-- Persistent messaging system for StudyPair

-- Create conversations table to track chat sessions between users
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid not null references public.profiles(id) on delete cascade,
  participant_2 uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add unique constraint for conversation participants after table creation
create unique index if not exists unique_conversation_participants 
on public.conversations (least(participant_1, participant_2), greatest(participant_1, participant_2));

-- Create messages table to store all chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  message_type text default 'text' check (message_type in ('text', 'image', 'file')),
  metadata jsonb default '{}',
  is_edited boolean default false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  constraint content_not_empty check (char_length(content) > 0),
  constraint content_max_length check (char_length(content) <= 4000)
);

-- Create message_read_status table to track read receipts
create table if not exists public.message_read_status (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one read status per user per message
  constraint unique_user_message unique (message_id, user_id)
);

-- Indexes for better performance
create index if not exists idx_conversations_participants on public.conversations using btree (participant_1, participant_2);
create index if not exists idx_conversations_updated on public.conversations using btree (updated_at desc);
create index if not exists idx_messages_conversation on public.messages using btree (conversation_id, created_at desc);
create index if not exists idx_messages_sender on public.messages using btree (sender_id);
create index if not exists idx_message_read_status_user on public.message_read_status using btree (user_id);

-- Enable RLS (Row Level Security)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_read_status enable row level security;

-- RLS Policies for conversations
create policy "Users can view their own conversations" on public.conversations
  for select using (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

create policy "Users can create conversations they participate in" on public.conversations
  for insert with check (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

create policy "Users can update their own conversations" on public.conversations
  for update using (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

-- RLS Policies for messages
create policy "Users can view messages in their conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Users can insert messages in their conversations" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Users can update their own messages" on public.messages
  for update using (sender_id = auth.uid());

-- RLS Policies for message read status
create policy "Users can view read status for their messages" on public.message_read_status
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.messages m
      where m.id = message_id and m.sender_id = auth.uid()
    )
  );

create policy "Users can mark messages as read" on public.message_read_status
  for insert with check (user_id = auth.uid());

-- Function to get or create a conversation between two users
create or replace function public.get_or_create_conversation(
  user1_id uuid,
  user2_id uuid
)
returns uuid as $$
declare
  conversation_id uuid;
  participant1 uuid;
  participant2 uuid;
begin
  -- Ensure consistent ordering for participants
  if user1_id < user2_id then
    participant1 := user1_id;
    participant2 := user2_id;
  else
    participant1 := user2_id;
    participant2 := user1_id;
  end if;

  -- Try to find existing conversation
  select id into conversation_id
  from public.conversations
  where participant_1 = participant1 and participant_2 = participant2;

  -- If no conversation exists, create one
  if conversation_id is null then
    insert into public.conversations (participant_1, participant_2)
    values (participant1, participant2)
    returning id into conversation_id;
  end if;

  return conversation_id;
end;
$$ language plpgsql security definer;

-- Function to send a message
create or replace function public.send_message(
  p_recipient_username text,
  p_content text,
  p_message_type text default 'text'
)
returns json as $$
declare
  recipient_id uuid;
  conversation_id uuid;
  new_message_id uuid;
  result json;
begin
  -- Get recipient ID from username
  select id into recipient_id
  from public.profiles
  where username = p_recipient_username;

  if recipient_id is null then
    return json_build_object('error', 'Recipient not found');
  end if;

  if recipient_id = auth.uid() then
    return json_build_object('error', 'Cannot send message to yourself');
  end if;

  -- Get or create conversation
  select public.get_or_create_conversation(auth.uid(), recipient_id) into conversation_id;

  -- Insert the message
  insert into public.messages (conversation_id, sender_id, content, message_type)
  values (conversation_id, auth.uid(), p_content, p_message_type)
  returning id into new_message_id;

  -- Update conversation timestamp
  update public.conversations
  set updated_at = now()
  where id = conversation_id;

  -- Return the message details
  select json_build_object(
    'id', m.id,
    'conversation_id', m.conversation_id,
    'content', m.content,
    'message_type', m.message_type,
    'sender', json_build_object(
      'id', p.id,
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    ),
    'created_at', m.created_at,
    'is_edited', m.is_edited
  ) into result
  from public.messages m
  join public.profiles p on m.sender_id = p.id
  where m.id = new_message_id;

  return result;
end;
$$ language plpgsql security definer;

-- Function to get conversation messages
create or replace function public.get_conversation_messages(
  p_conversation_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
)
returns json as $$
begin
  return (
    select json_agg(
      json_build_object(
        'id', m.id,
        'conversation_id', m.conversation_id,
        'content', m.content,
        'message_type', m.message_type,
        'sender', json_build_object(
          'id', p.id,
          'username', p.username,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url
        ),
        'created_at', m.created_at,
        'is_edited', m.is_edited,
        'edited_at', m.edited_at
      )
      order by m.created_at asc
    )
    from public.messages m
    join public.profiles p on m.sender_id = p.id
    where m.conversation_id = p_conversation_id
    and exists (
      select 1 from public.conversations c
      where c.id = p_conversation_id
      and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
    limit p_limit
    offset p_offset
  );
end;
$$ language plpgsql security definer;

-- Function to get conversation by username
create or replace function public.get_conversation_by_username(
  p_username text
)
returns json as $$
declare
  other_user_id uuid;
  conversation_id uuid;
  result json;
begin
  -- Get the other user's ID
  select id into other_user_id
  from public.profiles
  where username = p_username;

  if other_user_id is null then
    return json_build_object('error', 'User not found');
  end if;

  if other_user_id = auth.uid() then
    return json_build_object('error', 'Cannot get conversation with yourself');
  end if;

  -- Get or create conversation
  select public.get_or_create_conversation(auth.uid(), other_user_id) into conversation_id;

  -- Return conversation details with recent messages
  select json_build_object(
    'id', c.id,
    'participant_1', json_build_object(
      'id', p1.id,
      'username', p1.username,
      'full_name', p1.full_name,
      'avatar_url', p1.avatar_url
    ),
    'participant_2', json_build_object(
      'id', p2.id,
      'username', p2.username,
      'full_name', p2.full_name,
      'avatar_url', p2.avatar_url
    ),
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'messages', public.get_conversation_messages(c.id, 50, 0)
  ) into result
  from public.conversations c
  join public.profiles p1 on c.participant_1 = p1.id
  join public.profiles p2 on c.participant_2 = p2.id
  where c.id = conversation_id;

  return result;
end;
$$ language plpgsql security definer;

-- Function to get user's conversations list
create or replace function public.get_user_conversations()
returns json as $$
begin
  return (
    select json_agg(
      json_build_object(
        'id', c.id,
        'other_user', case
          when c.participant_1 = auth.uid() then json_build_object(
            'id', p2.id,
            'username', p2.username,
            'full_name', p2.full_name,
            'avatar_url', p2.avatar_url
          )
          else json_build_object(
            'id', p1.id,
            'username', p1.username,
            'full_name', p1.full_name,
            'avatar_url', p1.avatar_url
          )
        end,
        'last_message', (
          select json_build_object(
            'content', content,
            'created_at', created_at,
            'sender_id', sender_id
          )
          from public.messages
          where conversation_id = c.id
          order by created_at desc
          limit 1
        ),
        'updated_at', c.updated_at,
        'unread_count', (
          select count(*)
          from public.messages m
          where m.conversation_id = c.id
          and m.sender_id != auth.uid()
          and not exists (
            select 1 from public.message_read_status mrs
            where mrs.message_id = m.id
            and mrs.user_id = auth.uid()
          )
        )
      )
      order by c.updated_at desc
    )
    from public.conversations c
    join public.profiles p1 on c.participant_1 = p1.id
    join public.profiles p2 on c.participant_2 = p2.id
    where c.participant_1 = auth.uid() or c.participant_2 = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Function to mark message as read
create or replace function public.mark_message_read(p_message_id uuid)
returns boolean as $$
begin
  insert into public.message_read_status (message_id, user_id)
  values (p_message_id, auth.uid())
  on conflict (message_id, user_id) do nothing;
  
  return true;
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;
grant all on public.message_read_status to authenticated;
grant execute on function public.get_or_create_conversation to authenticated;
grant execute on function public.send_message to authenticated;
grant execute on function public.get_conversation_messages to authenticated;
grant execute on function public.get_conversation_by_username to authenticated;
grant execute on function public.get_user_conversations to authenticated;
grant execute on function public.mark_message_read to authenticated;

-- Create a trigger to update conversation timestamp when a message is sent
create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;
  
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_conversation_timestamp
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();
