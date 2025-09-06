-- 025_points_store.sql
-- Points store system for profile customization

-- Store items table
create table public.store_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null check (category in ('profile_border', 'profile_badge', 'profile_theme', 'profile_title')),
  price integer not null check (price > 0),
  image_url text,
  is_active boolean default true,
  rarity text default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User purchases table
create table public.user_purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.store_items(id) on delete cascade not null,
  purchased_at timestamp with time zone default now(),
  -- Prevent duplicate purchases
  unique(user_id, item_id)
);

-- User equipped items table
create table public.user_equipped_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.store_items(id) on delete cascade not null,
  category text not null,
  equipped_at timestamp with time zone default now(),
  -- Only one item per category can be equipped
  unique(user_id, category)
);

-- Add profile customization fields to profiles table
alter table public.profiles add column if not exists profile_border_color text default '#e5e7eb';
alter table public.profiles add column if not exists profile_badge text;
alter table public.profiles add column if not exists profile_theme text default 'default';
alter table public.profiles add column if not exists profile_title text;

-- Create indexes
create index idx_store_items_category on public.store_items(category);
create index idx_store_items_active on public.store_items(is_active);
create index idx_user_purchases_user_id on public.user_purchases(user_id);
create index idx_user_equipped_items_user_id on public.user_equipped_items(user_id);

-- Enable RLS
alter table public.store_items enable row level security;
alter table public.user_purchases enable row level security;
alter table public.user_equipped_items enable row level security;

-- RLS policies for store_items (public read)
create policy "Anyone can view active store items" on public.store_items
  for select using (is_active = true);

-- RLS policies for user_purchases
create policy "Users can view their own purchases" on public.user_purchases
  for select using (auth.uid() = user_id);

create policy "Users can create their own purchases" on public.user_purchases
  for insert with check (auth.uid() = user_id);

-- RLS policies for user_equipped_items
create policy "Users can view their own equipped items" on public.user_equipped_items
  for select using (auth.uid() = user_id);

create policy "Users can manage their own equipped items" on public.user_equipped_items
  for all using (auth.uid() = user_id);

-- Function to purchase an item
create or replace function public.purchase_store_item(
  p_item_id uuid,
  p_user_id uuid default auth.uid()
)
returns jsonb as $$
declare
  item_record record;
  user_points integer;
  purchase_result jsonb;
begin
  -- Check if user exists and get their points
  select total_points into user_points
  from public.profiles
  where id = p_user_id;
  
  if user_points is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  
  -- Get item details
  select * into item_record
  from public.store_items
  where id = p_item_id and is_active = true;
  
  if item_record is null then
    return jsonb_build_object('success', false, 'error', 'Item not found or inactive');
  end if;
  
  -- Check if user already owns this item
  if exists (
    select 1 from public.user_purchases
    where user_id = p_user_id and item_id = p_item_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Item already owned');
  end if;
  
  -- Check if user has enough points
  if user_points < item_record.price then
    return jsonb_build_object('success', false, 'error', 'Insufficient points');
  end if;
  
  -- Deduct points from user
  update public.profiles
  set total_points = total_points - item_record.price,
      updated_at = now()
  where id = p_user_id;
  
  -- Create purchase record
  insert into public.user_purchases (user_id, item_id)
  values (p_user_id, p_item_id);
  
  -- Log the purchase transaction
  insert into public.point_transactions (user_id, points, transaction_type, source, description)
  values (p_user_id, -item_record.price, 'spent', 'store_purchase', 
          'Purchased: ' || item_record.name);
  
  return jsonb_build_object(
    'success', true,
    'item', jsonb_build_object(
      'id', item_record.id,
      'name', item_record.name,
      'price', item_record.price
    ),
    'new_points_balance', user_points - item_record.price
  );
exception
  when others then
    return jsonb_build_object('success', false, 'error', 'Purchase failed: ' || SQLERRM);
end;
$$ language plpgsql security definer;

-- Function to equip an item
create or replace function public.equip_store_item(
  p_item_id uuid,
  p_user_id uuid default auth.uid()
)
returns jsonb as $$
declare
  item_record record;
begin
  -- Check if user owns this item
  if not exists (
    select 1 from public.user_purchases
    where user_id = p_user_id and item_id = p_item_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Item not owned');
  end if;
  
  -- Get item details
  select * into item_record
  from public.store_items
  where id = p_item_id;
  
  -- Unequip any existing item in this category
  delete from public.user_equipped_items
  where user_id = p_user_id and category = item_record.category;
  
  -- Equip the new item
  insert into public.user_equipped_items (user_id, item_id, category)
  values (p_user_id, p_item_id, item_record.category);
  
  -- Update profile fields based on category
  case item_record.category
    when 'profile_border' then
      update public.profiles 
      set profile_border_color = item_record.image_url
      where id = p_user_id;
    when 'profile_badge' then
      update public.profiles 
      set profile_badge = item_record.image_url
      where id = p_user_id;
    when 'profile_theme' then
      update public.profiles 
      set profile_theme = item_record.name
      where id = p_user_id;
    when 'profile_title' then
      update public.profiles 
      set profile_title = item_record.name
      where id = p_user_id;
  end case;
  
  return jsonb_build_object('success', true, 'equipped_item', item_record.name);
exception
  when others then
    return jsonb_build_object('success', false, 'error', 'Equip failed: ' || SQLERRM);
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function public.purchase_store_item(uuid, uuid) to authenticated;
grant execute on function public.equip_store_item(uuid, uuid) to authenticated;

-- Insert sample store items
insert into public.store_items (name, description, category, price, image_url, rarity) values
-- Profile Borders
('Golden Border', 'A shimmering golden border for your profile', 'profile_border', 100, '#ffd700', 'rare'),
('Silver Border', 'A sleek silver border for your profile', 'profile_border', 50, '#c0c0c0', 'common'),
('Diamond Border', 'A brilliant diamond border for your profile', 'profile_border', 500, '#b9f2ff', 'legendary'),
('Emerald Border', 'A vibrant emerald green border', 'profile_border', 200, '#50c878', 'epic'),
('Ruby Border', 'A rich ruby red border', 'profile_border', 200, '#e0115f', 'epic'),

-- Profile Badges
('Scholar Badge', 'Badge for dedicated students', 'profile_badge', 75, '🎓', 'common'),
('Champion Badge', 'Badge for quiz champions', 'profile_badge', 150, '🏆', 'rare'),
('Star Badge', 'Badge for outstanding performers', 'profile_badge', 300, '⭐', 'epic'),
('Crown Badge', 'Badge for the elite', 'profile_badge', 750, '👑', 'legendary'),
('Fire Badge', 'Badge for hot streaks', 'profile_badge', 125, '🔥', 'rare'),

-- Profile Themes
('Dark Mode', 'Sleek dark theme for your profile', 'profile_theme', 80, 'dark', 'common'),
('Ocean Theme', 'Calming ocean blue theme', 'profile_theme', 120, 'ocean', 'rare'),
('Forest Theme', 'Natural green forest theme', 'profile_theme', 120, 'forest', 'rare'),
('Sunset Theme', 'Warm sunset colors theme', 'profile_theme', 180, 'sunset', 'epic'),
('Galaxy Theme', 'Cosmic space theme', 'profile_theme', 400, 'galaxy', 'legendary'),

-- Profile Titles
('Study Buddy', 'The friendly helper', 'profile_title', 60, null, 'common'),
('Quiz Master', 'Master of all quizzes', 'profile_title', 150, null, 'rare'),
('Knowledge Seeker', 'Always learning', 'profile_title', 100, null, 'common'),
('Academic Elite', 'Top of the class', 'profile_title', 350, null, 'epic'),
('Learning Legend', 'Legendary learner', 'profile_title', 800, null, 'legendary');
