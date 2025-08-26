-- Migration: Notification System
-- Description: Comprehensive database-backed notification system

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('message', 'study_session', 'exam_reminder', 'group_invite', 'achievement', 'system', 'schedule_update')),
  title text not null,
  message text not null,
  is_read boolean default false,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  actionable boolean default false,
  link text,
  avatar text,
  
  -- Metadata for rich notifications
  metadata jsonb default '{}',
  
  -- Auto-aggregation fields
  group_key text, -- For grouping similar notifications
  aggregated_count integer default 1,
  
  -- Timing and expiry
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  read_at timestamp with time zone,
  
  -- Delivery tracking
  delivery_status text default 'pending' check (delivery_status in ('pending', 'delivered', 'failed', 'expired')),
  delivery_attempts integer default 0,
  last_delivery_attempt timestamp with time zone
);

-- Create notification settings table
create table public.notification_settings (
  user_id uuid references auth.users on delete cascade primary key,
  
  -- General preferences
  enable_push_notifications boolean default true,
  enable_email_notifications boolean default true,
  notification_sound boolean default true,
  
  -- Type-specific preferences
  enable_study_reminders boolean default true,
  enable_group_invites boolean default true,
  enable_exam_reminders boolean default true,
  enable_achievement_notifications boolean default true,
  enable_message_notifications boolean default true,
  enable_system_notifications boolean default true,
  enable_schedule_notifications boolean default true,
  
  -- Quiet hours
  quiet_hours_enabled boolean default false,
  quiet_hours_start time default '22:00:00',
  quiet_hours_end time default '08:00:00',
  
  -- Aggregation preferences
  enable_notification_grouping boolean default true,
  max_notifications_per_hour integer default 10,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notification templates table for reusable notifications
create table public.notification_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  type text not null,
  title_template text not null, -- Can contain placeholders like {user_name}
  message_template text not null,
  priority text default 'medium',
  actionable boolean default false,
  link_template text,
  group_key_template text,
  metadata_template jsonb default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_type on public.notifications(type);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_priority on public.notifications(priority);
create index idx_notifications_group_key on public.notifications(group_key);
create index idx_notifications_expires_at on public.notifications(expires_at);
create index idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;

-- Composite index for efficient queries
create index idx_notifications_user_type_created on public.notifications(user_id, type, created_at desc);

-- Enable RLS
alter table public.notifications enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_templates enable row level security;

-- RLS Policies for notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Admin/system can insert notifications for users
create policy "System can create notifications"
  on public.notifications for insert
  with check (true); -- Will be restricted by server-side functions

-- RLS Policies for notification settings
create policy "Users can view own notification settings"
  on public.notification_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own notification settings"
  on public.notification_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert own notification settings"
  on public.notification_settings for insert
  with check (auth.uid() = user_id);

-- RLS Policies for notification templates (read-only for users)
create policy "Users can view notification templates"
  on public.notification_templates for select
  using (is_active = true);

-- Function to get user notification settings with defaults
create or replace function public.get_user_notification_settings(p_user_id uuid)
returns table(
  enable_push_notifications boolean,
  enable_email_notifications boolean,
  notification_sound boolean,
  enable_study_reminders boolean,
  enable_group_invites boolean,
  enable_exam_reminders boolean,
  enable_achievement_notifications boolean,
  enable_message_notifications boolean,
  enable_system_notifications boolean,
  enable_schedule_notifications boolean,
  quiet_hours_enabled boolean,
  quiet_hours_start time,
  quiet_hours_end time,
  enable_notification_grouping boolean,
  max_notifications_per_hour integer
) as $$
begin
  return query
  select 
    coalesce(ns.enable_push_notifications, true),
    coalesce(ns.enable_email_notifications, true),
    coalesce(ns.notification_sound, true),
    coalesce(ns.enable_study_reminders, true),
    coalesce(ns.enable_group_invites, true),
    coalesce(ns.enable_exam_reminders, true),
    coalesce(ns.enable_achievement_notifications, true),
    coalesce(ns.enable_message_notifications, true),
    coalesce(ns.enable_system_notifications, true),
    coalesce(ns.enable_schedule_notifications, true),
    coalesce(ns.quiet_hours_enabled, false),
    coalesce(ns.quiet_hours_start, '22:00:00'::time),
    coalesce(ns.quiet_hours_end, '08:00:00'::time),
    coalesce(ns.enable_notification_grouping, true),
    coalesce(ns.max_notifications_per_hour, 10)
  from (
    select p_user_id as user_id
  ) u
  left join public.notification_settings ns on ns.user_id = u.user_id;
end;
$$ language plpgsql security definer;

-- Function to check if user is in quiet hours
create or replace function public.is_user_in_quiet_hours(p_user_id uuid)
returns boolean as $$
declare
  settings record;
  current_time_of_day time;
begin
  select * into settings from public.get_user_notification_settings(p_user_id);
  
  if not settings.quiet_hours_enabled then
    return false;
  end if;
  
  current_time_of_day := current_time;
  
  -- Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if settings.quiet_hours_start > settings.quiet_hours_end then
    return current_time_of_day >= settings.quiet_hours_start 
           or current_time_of_day <= settings.quiet_hours_end;
  else
    return current_time_of_day >= settings.quiet_hours_start 
           and current_time_of_day <= settings.quiet_hours_end;
  end if;
end;
$$ language plpgsql security definer;

-- Function to create a notification with smart delivery
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_priority text default 'medium',
  p_actionable boolean default false,
  p_link text default null,
  p_avatar text default null,
  p_metadata jsonb default '{}',
  p_group_key text default null,
  p_expires_hours integer default null
)
returns uuid as $$
declare
  notification_id uuid;
  user_settings record;
  setting_field text;
  notification_enabled boolean;
  existing_notification record;
  expire_time timestamp with time zone;
begin
  -- Get user notification settings
  select * into user_settings from public.get_user_notification_settings(p_user_id);
  
  -- Check if this notification type is enabled for the user
  setting_field := case p_type
    when 'study_session' then 'enable_study_reminders'
    when 'group_invite' then 'enable_group_invites'
    when 'exam_reminder' then 'enable_exam_reminders'
    when 'achievement' then 'enable_achievement_notifications'
    when 'message' then 'enable_message_notifications'
    when 'system' then 'enable_system_notifications'
    when 'schedule_update' then 'enable_schedule_notifications'
    else 'enable_push_notifications'
  end;
  
  -- Get the setting value using dynamic SQL (in real implementation, use a case statement)
  notification_enabled := case setting_field
    when 'enable_study_reminders' then user_settings.enable_study_reminders
    when 'enable_group_invites' then user_settings.enable_group_invites
    when 'enable_exam_reminders' then user_settings.enable_exam_reminders
    when 'enable_achievement_notifications' then user_settings.enable_achievement_notifications
    when 'enable_message_notifications' then user_settings.enable_message_notifications
    when 'enable_system_notifications' then user_settings.enable_system_notifications
    when 'enable_schedule_notifications' then user_settings.enable_schedule_notifications
    else user_settings.enable_push_notifications
  end;
  
  if not notification_enabled then
    return null; -- Don't create notification if disabled
  end if;
  
  -- Set expiry time if specified
  if p_expires_hours is not null then
    expire_time := now() + (p_expires_hours || ' hours')::interval;
  end if;
  
  -- Check for notification grouping
  if user_settings.enable_notification_grouping and p_group_key is not null then
    -- Look for existing notification with same group key in last hour
    select * into existing_notification
    from public.notifications
    where user_id = p_user_id 
      and group_key = p_group_key
      and created_at > now() - interval '1 hour'
      and is_read = false
    order by created_at desc
    limit 1;
    
    if found then
      -- Update existing notification instead of creating new one
      update public.notifications
      set 
        aggregated_count = aggregated_count + 1,
        message = p_message, -- Update with latest message
        metadata = p_metadata,
        created_at = now() -- Update timestamp
      where id = existing_notification.id;
      
      return existing_notification.id;
    end if;
  end if;
  
  -- Create new notification
  insert into public.notifications (
    user_id, type, title, message, priority, actionable, 
    link, avatar, metadata, group_key, expires_at
  ) values (
    p_user_id, p_type, p_title, p_message, p_priority, p_actionable,
    p_link, p_avatar, p_metadata, p_group_key, expire_time
  ) returning id into notification_id;
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to create notification from template
create or replace function public.create_notification_from_template(
  p_user_id uuid,
  p_template_name text,
  p_variables jsonb default '{}'
)
returns uuid as $$
declare
  template record;
  title text;
  message text;
  link text;
  group_key text;
  notification_id uuid;
begin
  -- Get template
  select * into template 
  from public.notification_templates 
  where name = p_template_name and is_active = true;
  
  if not found then
    raise exception 'Template not found: %', p_template_name;
  end if;
  
  -- Replace placeholders in templates
  title := template.title_template;
  message := template.message_template;
  link := template.link_template;
  group_key := template.group_key_template;
  
  -- Simple placeholder replacement (in production, use a proper template engine)
  if p_variables ? 'user_name' then
    title := replace(title, '{user_name}', p_variables->>'user_name');
    message := replace(message, '{user_name}', p_variables->>'user_name');
  end if;
  
  if p_variables ? 'achievement_name' then
    title := replace(title, '{achievement_name}', p_variables->>'achievement_name');
    message := replace(message, '{achievement_name}', p_variables->>'achievement_name');
  end if;
  
  -- Add more placeholder replacements as needed
  
  -- Create notification
  notification_id := public.create_notification(
    p_user_id,
    template.type,
    title,
    message,
    template.priority,
    template.actionable,
    link,
    null, -- avatar
    template.metadata_template || p_variables,
    group_key
  );
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to mark notifications as read
create or replace function public.mark_notifications_read(
  p_user_id uuid,
  p_notification_ids uuid[] default null
)
returns integer as $$
declare
  affected_count integer;
begin
  if p_notification_ids is null then
    -- Mark all as read
    update public.notifications
    set is_read = true, read_at = now()
    where user_id = p_user_id and is_read = false;
  else
    -- Mark specific notifications as read
    update public.notifications
    set is_read = true, read_at = now()
    where user_id = p_user_id and id = any(p_notification_ids);
  end if;
  
  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$ language plpgsql security definer;

-- Function to get user notifications with pagination
create or replace function public.get_user_notifications(
  p_user_id uuid,
  p_limit integer default 20,
  p_offset integer default 0,
  p_type text default null,
  p_unread_only boolean default false
)
returns table(
  id uuid,
  type text,
  title text,
  message text,
  is_read boolean,
  priority text,
  actionable boolean,
  link text,
  avatar text,
  metadata jsonb,
  aggregated_count integer,
  created_at timestamp with time zone,
  read_at timestamp with time zone
) as $$
begin
  return query
  select 
    n.id, n.type, n.title, n.message, n.is_read, 
    n.priority, n.actionable, n.link, n.avatar, 
    n.metadata, n.aggregated_count, n.created_at, n.read_at
  from public.notifications n
  where n.user_id = p_user_id
    and (p_type is null or n.type = p_type)
    and (not p_unread_only or n.is_read = false)
    and (n.expires_at is null or n.expires_at > now())
  order by n.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;

-- Function to cleanup expired notifications
create or replace function public.cleanup_expired_notifications()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from public.notifications
  where expires_at is not null and expires_at < now();
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- Insert default notification templates
insert into public.notification_templates (name, type, title_template, message_template, priority, actionable, group_key_template) values
('friend_request', 'message', 'New Friend Request', '{user_name} sent you a friend request', 'medium', true, 'friend_request'),
('friend_accepted', 'message', 'Friend Request Accepted', '{user_name} accepted your friend request', 'low', false, 'friend_accepted'),
('achievement_unlocked', 'achievement', 'Achievement Unlocked!', 'You unlocked the "{achievement_name}" achievement', 'medium', true, 'achievement'),
('points_milestone', 'achievement', 'Points Milestone!', 'Congratulations! You reached {points} points', 'low', false, 'points_milestone'),
('level_up', 'achievement', 'Level Up!', 'Amazing! You reached level {level}', 'medium', true, 'level_up');

-- Grant necessary permissions
grant execute on function public.get_user_notification_settings(uuid) to authenticated;
grant execute on function public.is_user_in_quiet_hours(uuid) to authenticated;
grant execute on function public.create_notification(uuid, text, text, text, text, boolean, text, text, jsonb, text, integer) to authenticated;
grant execute on function public.create_notification_from_template(uuid, text, jsonb) to authenticated;
grant execute on function public.mark_notifications_read(uuid, uuid[]) to authenticated;
grant execute on function public.get_user_notifications(uuid, integer, integer, text, boolean) to authenticated;
grant execute on function public.cleanup_expired_notifications() to authenticated;
