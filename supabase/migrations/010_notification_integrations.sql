-- Integration functions for StudyPair notifications
-- These functions create notifications automatically when certain events occur

-- Function to create peer connection notifications
create or replace function public.create_peer_notification(
  p_event_type text,
  p_requester_id uuid,
  p_addressee_id uuid
)
returns uuid as $$
declare
  notification_id uuid;
  requester_name text;
  addressee_name text;
begin
  -- Get user names
  select full_name into requester_name from public.profiles where id = p_requester_id;
  select full_name into addressee_name from public.profiles where id = p_addressee_id;
  
  case p_event_type
    when 'friend_request' then
      notification_id := public.create_notification_from_template(
        p_addressee_id,
        'friend_request',
        jsonb_build_object('user_name', requester_name)
      );
      
    when 'friend_accepted' then
      notification_id := public.create_notification_from_template(
        p_requester_id,
        'friend_accepted',
        jsonb_build_object('user_name', addressee_name)
      );
      
    else
      raise exception 'Unknown peer event type: %', p_event_type;
  end case;
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to create achievement notifications
create or replace function public.create_achievement_notification(
  p_user_id uuid,
  p_achievement_name text,
  p_achievement_title text
)
returns uuid as $$
declare
  notification_id uuid;
begin
  notification_id := public.create_notification_from_template(
    p_user_id,
    'achievement_unlocked',
    jsonb_build_object('achievement_name', p_achievement_title)
  );
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to create points milestone notifications
create or replace function public.create_points_milestone_notification(
  p_user_id uuid,
  p_points integer
)
returns uuid as $$
declare
  notification_id uuid;
begin
  notification_id := public.create_notification_from_template(
    p_user_id,
    'points_milestone',
    jsonb_build_object('points', p_points::text)
  );
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to create level up notifications
create or replace function public.create_level_up_notification(
  p_user_id uuid,
  p_level integer
)
returns uuid as $$
declare
  notification_id uuid;
begin
  notification_id := public.create_notification_from_template(
    p_user_id,
    'level_up',
    jsonb_build_object('level', p_level::text)
  );
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Trigger function for peer connections
create or replace function public.handle_peer_connection_notification()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    -- New friend request
    perform public.create_peer_notification(
      'friend_request',
      NEW.requester_id,
      NEW.addressee_id
    );
    
  elsif TG_OP = 'UPDATE' and OLD.status != NEW.status then
    -- Status changed
    if NEW.status = 'accepted' then
      perform public.create_peer_notification(
        'friend_accepted',
        NEW.requester_id,
        NEW.addressee_id
      );
    end if;
  end if;
  
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

-- Trigger function for achievements
create or replace function public.handle_achievement_notification()
returns trigger as $$
declare
  achievement_record record;
begin
  -- Get achievement details
  select title, name into achievement_record 
  from public.achievements 
  where id = NEW.achievement_id;
  
  -- Create notification
  perform public.create_achievement_notification(
    NEW.user_id,
    achievement_record.name,
    achievement_record.title
  );
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Enhanced add_points function with milestone notifications
create or replace function public.add_points_to_user_with_notifications(
  p_user_id uuid,
  p_points integer,
  p_source text,
  p_source_id uuid default null,
  p_description text default null
)
returns void as $$
declare
  current_points integer;
  new_total_points integer;
  new_experience_points integer;
  new_level integer;
  old_level integer;
  milestone_reached integer;
begin
  -- Get current stats
  select total_points, experience_points, level 
  into current_points, new_experience_points, old_level
  from public.profiles 
  where id = p_user_id;
  
  -- Calculate new totals
  new_total_points := current_points + p_points;
  new_experience_points := new_experience_points + p_points;
  new_level := public.calculate_level(new_experience_points);
  
  -- Update user profile
  update public.profiles 
  set 
    total_points = new_total_points,
    experience_points = new_experience_points,
    level = new_level,
    updated_at = now()
  where id = p_user_id;
  
  -- Create transaction record
  insert into public.point_transactions (
    user_id, points, transaction_type, source, source_id, description
  ) values (
    p_user_id, p_points, 'earned', p_source, p_source_id, p_description
  );
  
  -- Check for level up notification
  if new_level > old_level then
    perform public.create_level_up_notification(p_user_id, new_level);
  end if;
  
  -- Check for points milestones (every 1000 points)
  milestone_reached := (new_total_points / 1000) * 1000;
  if milestone_reached > 0 and milestone_reached != ((current_points / 1000) * 1000) then
    perform public.create_points_milestone_notification(p_user_id, milestone_reached);
  end if;
  
  -- Check for new achievements
  perform public.check_and_award_achievements(p_user_id);
end;
$$ language plpgsql security definer;

-- Create triggers
drop trigger if exists peer_connection_notification_trigger on public.peer_connections;
create trigger peer_connection_notification_trigger
  after insert or update on public.peer_connections
  for each row execute function public.handle_peer_connection_notification();

drop trigger if exists achievement_notification_trigger on public.user_achievements;  
create trigger achievement_notification_trigger
  after insert on public.user_achievements
  for each row execute function public.handle_achievement_notification();

-- Grant permissions
grant execute on function public.create_peer_notification(text, uuid, uuid) to authenticated;
grant execute on function public.create_achievement_notification(uuid, text, text) to authenticated;
grant execute on function public.create_points_milestone_notification(uuid, integer) to authenticated;
grant execute on function public.create_level_up_notification(uuid, integer) to authenticated;
grant execute on function public.add_points_to_user_with_notifications(uuid, integer, text, uuid, text) to authenticated;
