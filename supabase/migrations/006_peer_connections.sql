-- 006_peer_connections_simplified.sql
-- Comprehensive migration for peer connection system with simplified search

-- Table for peer connections/friendships
create table if not exists public.peer_connections (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined', 'blocked')) default 'pending',
  message text, -- Optional message with connection request
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique combinations and prevent self-connections
  unique(requester_id, addressee_id),
  check (requester_id != addressee_id)
);

-- Index for efficient lookups
create index idx_peer_connections_requester on public.peer_connections(requester_id);
create index idx_peer_connections_addressee on public.peer_connections(addressee_id);
create index idx_peer_connections_status on public.peer_connections(status);
create index idx_peer_connections_updated on public.peer_connections(updated_at desc);

-- RLS policies for peer connections
alter table public.peer_connections enable row level security;

-- Users can view connections where they are involved
create policy "Users can view their own connections" on public.peer_connections
  for select using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Users can create connection requests
create policy "Users can create connection requests" on public.peer_connections
  for insert with check (
    auth.uid() = requester_id and
    requester_id != addressee_id
  );

-- Users can update connections where they are involved
create policy "Users can update their connections" on public.peer_connections
  for update using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Users can delete connections where they are involved
create policy "Users can delete their connections" on public.peer_connections
  for delete using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Add online status and last seen to profiles if not exists
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_online') then
    alter table public.profiles add column is_online boolean default false;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'last_seen') then
    alter table public.profiles add column last_seen timestamp with time zone;
  end if;
end
$$;

-- Function to get mutual connections between users
create or replace function public.get_mutual_connections(user1_id uuid, user2_id uuid)
returns integer as $$
declare
  mutual_count integer;
begin
  -- Find mutual connections
  select count(*) into mutual_count
  from (
    -- Get user1's connections
    select 
      case 
        when requester_id = user1_id then addressee_id
        else requester_id
      end as connection_id
    from public.peer_connections
    where (requester_id = user1_id or addressee_id = user1_id)
    and status = 'accepted'
    
    intersect
    
    -- Get user2's connections
    select 
      case 
        when requester_id = user2_id then addressee_id
        else requester_id
      end as connection_id
    from public.peer_connections
    where (requester_id = user2_id or addressee_id = user2_id)
    and status = 'accepted'
  ) mutual;
  
  return mutual_count;
end;
$$ language plpgsql security definer;

-- Function to get connection status between two users
create or replace function public.get_connection_status(user1_id uuid, user2_id uuid)
returns text as $$
declare
  connection_record record;
  result_status text;
begin
  -- Check if there's any connection between the users
  select * into connection_record
  from public.peer_connections
  where (requester_id = user1_id and addressee_id = user2_id)
     or (requester_id = user2_id and addressee_id = user1_id);
  
  if not found then
    return 'not_connected';
  end if;
  
  -- Return status based on perspective
  if connection_record.status = 'accepted' then
    return 'connected';
  elsif connection_record.status = 'blocked' then
    return 'blocked';
  elsif connection_record.status = 'declined' then
    return 'not_connected';
  elsif connection_record.status = 'pending' then
    if connection_record.requester_id = user1_id then
      return 'pending_sent';
    else
      return 'pending_received';
    end if;
  end if;
  
  return 'not_connected';
end;
$$ language plpgsql security definer;

-- Simplified function to search for peers (username/full_name only)
create or replace function public.search_peers(
  search_query text default '',
  current_user_id uuid default null,
  limit_count integer default 50
)
returns table(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year_of_study text,
  bio text,
  location text,
  connection_status text,
  mutual_connections integer,
  is_online boolean,
  last_seen timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.university,
    p.major,
    p.year_of_study,
    p.bio,
    p.location,
    coalesce(
      public.get_connection_status(current_user_id, p.id),
      'not_connected'
    ) as connection_status,
    coalesce(
      public.get_mutual_connections(current_user_id, p.id),
      0
    ) as mutual_connections,
    coalesce(p.is_online, false) as is_online,
    p.last_seen
  from public.profiles p
  where p.id != coalesce(current_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    and (
      search_query = '' or 
      p.full_name ilike '%' || search_query || '%' or
      p.username ilike '%' || search_query || '%'
    )
  order by 
    case when p.is_online then 0 else 1 end,
    p.full_name
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Simplified discover function (excludes connected/blocked users, username/full_name only)
create or replace function public.search_peers_discover(
  search_query text default '',
  current_user_id uuid default null,
  limit_count integer default 50
)
returns table(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year_of_study text,
  bio text,
  location text,
  connection_status text,
  mutual_connections integer,
  is_online boolean,
  last_seen timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.university,
    p.major,
    p.year_of_study,
    p.bio,
    p.location,
    'not_connected' as connection_status,
    coalesce(
      public.get_mutual_connections(current_user_id, p.id),
      0
    ) as mutual_connections,
    coalesce(p.is_online, false) as is_online,
    p.last_seen
  from public.profiles p
  where p.id != coalesce(current_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    -- Exclude users who are already connected or blocked
    and not exists (
      select 1 from public.peer_connections pc
      where ((pc.requester_id = current_user_id and pc.addressee_id = p.id) or
             (pc.requester_id = p.id and pc.addressee_id = current_user_id))
        and pc.status in ('accepted', 'blocked', 'pending')
    )
    and (
      search_query = '' or 
      p.full_name ilike '%' || search_query || '%' or
      p.username ilike '%' || search_query || '%'
    )
  order by 
    case when p.is_online then 0 else 1 end,
    p.full_name
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Function to get user's connections with status filter
create or replace function public.get_user_connections(
  user_id uuid,
  status_filter text default 'accepted'
)
returns table(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year_of_study text,
  bio text,
  location text,
  connection_status text,
  is_online boolean,
  last_seen timestamp with time zone,
  connected_at timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.university,
    p.major,
    p.year_of_study,
    p.bio,
    p.location,
    pc.status as connection_status,
    coalesce(p.is_online, false) as is_online,
    p.last_seen,
    pc.updated_at as connected_at
  from public.peer_connections pc
  join public.profiles p on (
    case 
      when pc.requester_id = user_id then p.id = pc.addressee_id
      else p.id = pc.requester_id
    end
  )
  where (pc.requester_id = user_id or pc.addressee_id = user_id)
    and pc.status = status_filter
  order by pc.updated_at desc;
end;
$$ language plpgsql security definer;

-- Function to get blocked users
create or replace function public.get_blocked_users(
  user_id uuid
)
returns table(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year_of_study text,
  bio text,
  location text,
  blocked_at timestamp with time zone,
  is_online boolean,
  last_seen timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.university,
    p.major,
    p.year_of_study,
    p.bio,
    p.location,
    pc.created_at as blocked_at,
    coalesce(p.is_online, false) as is_online,
    p.last_seen
  from public.profiles p
  inner join public.peer_connections pc on (
    (pc.requester_id = user_id and pc.addressee_id = p.id) or
    (pc.addressee_id = user_id and pc.requester_id = p.id)
  )
  where pc.status = 'blocked'
  order by pc.created_at desc;
end;
$$ language plpgsql security definer;

-- Function to unblock a user
create or replace function public.unblock_user(
  user_id uuid,
  target_user_id uuid
)
returns json as $$
declare
  existing_connection record;
begin
  -- Check if there's a blocked connection
  select * into existing_connection
  from public.peer_connections
  where ((requester_id = user_id and addressee_id = target_user_id) or
         (requester_id = target_user_id and addressee_id = user_id))
    and status = 'blocked';

  if not found then
    return json_build_object('success', false, 'error', 'No blocked connection found');
  end if;

  -- Remove the blocked connection entry
  delete from public.peer_connections
  where id = existing_connection.id;

  return json_build_object('success', true, 'message', 'User unblocked successfully');
end;
$$ language plpgsql security definer;

-- Function to update user online status
create or replace function public.update_user_online_status(
  user_id uuid,
  online_status boolean
)
returns void as $$
begin
  update public.profiles
  set 
    is_online = online_status,
    last_seen = case when online_status = false then now() else last_seen end
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Function to send connection request
create or replace function public.send_connection_request(
  target_user_id uuid,
  request_message text default null
)
returns json as $$
declare
  current_user_id uuid;
  existing_connection record;
  new_connection_id uuid;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;
  
  if current_user_id = target_user_id then
    return json_build_object('success', false, 'error', 'Cannot connect to yourself');
  end if;
  
  -- Check for existing connection
  select * into existing_connection
  from public.peer_connections
  where (requester_id = current_user_id and addressee_id = target_user_id)
     or (requester_id = target_user_id and addressee_id = current_user_id);
  
  if found then
    if existing_connection.status = 'accepted' then
      return json_build_object('success', false, 'error', 'Already connected');
    elsif existing_connection.status = 'pending' then
      return json_build_object('success', false, 'error', 'Connection request already sent');
    elsif existing_connection.status = 'blocked' then
      return json_build_object('success', false, 'error', 'Connection blocked');
    end if;
  end if;
  
  -- Create new connection request
  insert into public.peer_connections (requester_id, addressee_id, message, status)
  values (current_user_id, target_user_id, request_message, 'pending')
  returning id into new_connection_id;
  
  return json_build_object(
    'success', true,
    'connection_id', new_connection_id,
    'message', 'Connection request sent successfully'
  );
end;
$$ language plpgsql security definer;

-- Function to respond to connection request
create or replace function public.respond_to_connection_request(
  connection_id uuid,
  response text -- 'accept' or 'decline'
)
returns json as $$
declare
  current_user_id uuid;
  connection_record record;
begin
  current_user_id := auth.uid();
  
  if current_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;
  
  -- Get the connection record
  select * into connection_record
  from public.peer_connections
  where id = connection_id;
  
  if not found then
    return json_build_object('success', false, 'error', 'Connection request not found');
  end if;
  
  -- Check if current user is the addressee
  if connection_record.addressee_id != current_user_id then
    return json_build_object('success', false, 'error', 'Not authorized to respond to this request');
  end if;
  
  -- Check if request is still pending
  if connection_record.status != 'pending' then
    return json_build_object('success', false, 'error', 'Request is no longer pending');
  end if;
  
  -- Update the connection status
  update public.peer_connections
  set 
    status = case when response = 'accept' then 'accepted' else 'declined' end,
    updated_at = now()
  where id = connection_id;
  
  return json_build_object(
    'success', true,
    'message', 'Connection request ' || response || 'ed successfully'
  );
end;
$$ language plpgsql security definer;
