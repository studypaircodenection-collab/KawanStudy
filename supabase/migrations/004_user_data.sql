-- 004_user_data.sql
-- User data table for application-specific data storage

-- Create user_data table
create table if not exists public.user_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes
create index idx_user_data_user_id on public.user_data(user_id);
create index idx_user_data_created_at on public.user_data(created_at desc);

-- Enable RLS for user_data
alter table public.user_data enable row level security;

-- Create policies for user_data
create policy "Users can view own data" 
  on public.user_data for select 
  using (auth.uid() = user_id);

create policy "Users can insert own data" 
  on public.user_data for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own data" 
  on public.user_data for update 
  using (auth.uid() = user_id);

create policy "Users can delete own data" 
  on public.user_data for delete 
  using (auth.uid() = user_id);

-- Create trigger for updated_at
create trigger handle_updated_at_user_data
  before update on public.user_data
  for each row execute function public.handle_updated_at();
