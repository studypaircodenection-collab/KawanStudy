-- seeder.sql
-- Test data seeder for StudyPair gamification system
-- This file creates sample users with realistic gamification data for testing

-- Note: This seeder assumes you have the gamification system already set up
-- Run this after executing the main migrations

-- First, let's create some test users in the auth.users table
-- Note: In a real Supabase environment, users are created through auth signup
-- This is for development/testing purposes only

-- Insert test users into auth.users (mock data for development)
-- In production, users would be created through Supabase Auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'john.doe@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "John Doe", "avatar_url": "https://avatar.vercel.sh/john", "university": "University of Technology"}'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'jane.smith@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Jane Smith", "avatar_url": "https://avatar.vercel.sh/jane", "university": "State University"}'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'alex.wilson@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Alex Wilson", "avatar_url": "https://avatar.vercel.sh/alex", "university": "Tech Institute"}'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'sarah.brown@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Sarah Brown", "avatar_url": "https://avatar.vercel.sh/sarah", "university": "Medical College"}'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'mike.jones@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Mike Jones", "avatar_url": "https://avatar.vercel.sh/mike", "university": "Engineering School"}'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'emma.davis@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Emma Davis", "avatar_url": "https://avatar.vercel.sh/emma", "university": "Liberal Arts College"}'),
  ('77777777-7777-7777-7777-777777777777'::uuid, 'david.miller@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "David Miller", "avatar_url": "https://avatar.vercel.sh/david", "university": "Business School"}'),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'lisa.garcia@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Lisa Garcia", "avatar_url": "https://avatar.vercel.sh/lisa", "university": "Science University"}')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users with varied gamification stats
INSERT INTO public.profiles (
  id, full_name, username, email, bio, location, university, year_of_study, major, avatar_url,
  total_points, current_streak, longest_streak, level, experience_points, last_activity_date
) VALUES 
  -- John Doe - High achiever
  ('11111111-1111-1111-1111-111111111111'::uuid, 'John Doe', 'johndoe', 'john.doe@university.edu', 
   'Computer Science student passionate about algorithms and data structures.', 'San Francisco, CA', 
   'University of Technology', '3rd Year', 'Computer Science', 'https://avatar.vercel.sh/john',
   15750, 25, 30, 13, 15750, current_date),

  -- Jane Smith - Consistent performer
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Jane Smith', 'janesmith', 'jane.smith@university.edu',
   'Math major who loves tutoring others and solving complex problems.', 'Boston, MA',
   'State University', '4th Year', 'Mathematics', 'https://avatar.vercel.sh/jane',
   8920, 12, 45, 10, 8920, current_date),

  -- Alex Wilson - New but active
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Alex Wilson', 'alexwilson', 'alex.wilson@university.edu',
   'Engineering student interested in renewable energy and sustainability.', 'Austin, TX',
   'Tech Institute', '2nd Year', 'Mechanical Engineering', 'https://avatar.vercel.sh/alex',
   2450, 8, 8, 5, 2450, current_date),

  -- Sarah Brown - Medical student
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Sarah Brown', 'sarahbrown', 'sarah.brown@university.edu',
   'Pre-med student focused on biology and chemistry studies.', 'Chicago, IL',
   'Medical College', '1st Year', 'Biology', 'https://avatar.vercel.sh/sarah',
   5680, 15, 20, 8, 5680, current_date),

  -- Mike Jones - Casual user
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Mike Jones', 'mikejones', 'mike.jones@university.edu',
   'Business student balancing studies with part-time work.', 'Seattle, WA',
   'Engineering School', '3rd Year', 'Civil Engineering', 'https://avatar.vercel.sh/mike',
   1120, 3, 7, 4, 1120, current_date - interval '1 day'),

  -- Emma Davis - Highly engaged
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Emma Davis', 'emmadavis', 'emma.davis@university.edu',
   'Literature student with a passion for creative writing and analysis.', 'Portland, OR',
   'Liberal Arts College', '2nd Year', 'English Literature', 'https://avatar.vercel.sh/emma',
   12300, 20, 35, 11, 12300, current_date),

  -- David Miller - Business focused
  ('77777777-7777-7777-7777-777777777777'::uuid, 'David Miller', 'davidmiller', 'david.miller@university.edu',
   'MBA student specializing in entrepreneurship and innovation.', 'New York, NY',
   'Business School', 'Graduate', 'Business Administration', 'https://avatar.vercel.sh/david',
   7890, 5, 15, 9, 7890, current_date),

  -- Lisa Garcia - Science enthusiast
  ('88888888-8888-8888-8888-888888888888'::uuid, 'Lisa Garcia', 'lisagarcia', 'lisa.garcia@university.edu',
   'Physics student researching quantum mechanics and particle physics.', 'Los Angeles, CA',
   'Science University', '4th Year', 'Physics', 'https://avatar.vercel.sh/lisa',
   4320, 7, 12, 7, 4320, current_date)
ON CONFLICT (id) DO NOTHING;

-- Add realistic point transactions for each user
-- John Doe - High achiever with lots of activities
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 50, 'earned', 'tutor_session', 'Tutored calculus session', current_date - interval '1 day'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 25, 'earned', 'class_join', 'Joined algorithm study group', current_date - interval '2 days'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 50, 'earned', 'tutor_session', 'Helped with data structures', current_date - interval '3 days'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 15, 'earned', 'quiz', 'Completed Python quiz', current_date - interval '4 days'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 40, 'earned', 'tutor_session', 'Tutored database design', current_date - interval '5 days');

-- Jane Smith - Consistent performer
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, 25, 'earned', 'class_join', 'Joined linear algebra group', current_date - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 15, 'earned', 'quiz', 'Completed statistics quiz', current_date - interval '2 days'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 50, 'earned', 'tutor_session', 'Helped with calculus', current_date - interval '3 days'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 30, 'earned', 'study_session', 'Completed 3-hour study session', current_date - interval '4 days');

-- Alex Wilson - New but active
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333'::uuid, 15, 'earned', 'quiz', 'Completed thermodynamics quiz', current_date - interval '1 day'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 25, 'earned', 'class_join', 'Joined engineering design group', current_date - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 10, 'earned', 'study_session', 'Individual study session', current_date - interval '3 days');

-- Sarah Brown - Medical student
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('44444444-4444-4444-4444-444444444444'::uuid, 15, 'earned', 'quiz', 'Biology quiz completion', current_date - interval '1 day'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 25, 'earned', 'class_join', 'Joined anatomy study group', current_date - interval '2 days'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 50, 'earned', 'tutor_session', 'Tutored organic chemistry', current_date - interval '3 days');

-- Award achievements based on their stats
INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
SELECT u.id, a.id, current_date - interval '5 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'johndoe' AND a.name IN ('rookie', 'rising_star', 'scholar', 'expert', 'master', 'consistent', 'dedicated', 'committed')
UNION ALL
SELECT u.id, a.id, current_date - interval '3 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'janesmith' AND a.name IN ('rookie', 'rising_star', 'scholar', 'consistent', 'dedicated')
UNION ALL
SELECT u.id, a.id, current_date - interval '2 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'alexwilson' AND a.name IN ('rookie', 'rising_star', 'consistent')
UNION ALL
SELECT u.id, a.id, current_date - interval '1 day'
FROM public.profiles u, public.achievements a
WHERE u.username = 'sarahbrown' AND a.name IN ('rookie', 'rising_star', 'scholar', 'consistent')
UNION ALL
SELECT u.id, a.id, current_date - interval '4 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'emmadavis' AND a.name IN ('rookie', 'rising_star', 'scholar', 'expert', 'consistent', 'dedicated')
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Add some daily challenge progress for current date
INSERT INTO public.user_daily_progress (user_id, challenge_id, current_progress, is_completed, completed_at)
SELECT 
  p.id as user_id,
  dc.id as challenge_id,
  CASE 
    WHEN dc.name = 'daily_login' THEN 1
    WHEN dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown') THEN 1
    WHEN dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis') THEN 1
    ELSE 0
  END as current_progress,
  CASE 
    WHEN dc.name = 'daily_login' THEN true
    WHEN dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown') THEN true
    WHEN dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis') THEN true
    ELSE false
  END as is_completed,
  CASE 
    WHEN dc.name = 'daily_login' OR 
         (dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown')) OR
         (dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis'))
    THEN now()
    ELSE null
  END as completed_at
FROM public.profiles p
CROSS JOIN public.daily_challenges dc
WHERE dc.name IN ('daily_login', 'complete_quiz', 'join_class', 'update_profile')
AND p.username IN ('johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'emmadavis')
ON CONFLICT (user_id, challenge_id, progress_date) DO NOTHING;

-- Add some activity logs to show recent activities
INSERT INTO public.activity_log (user_id, activity_type, activity_data, points_earned, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'tutor_session', '{"subject": "calculus", "duration": 60}', 50, current_timestamp - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'quiz', '{"subject": "statistics", "score": 95}', 15, current_timestamp - interval '4 hours'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'class_join', '{"group": "engineering design", "type": "study_group"}', 25, current_timestamp - interval '6 hours'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'study_session', '{"subject": "organic chemistry", "duration": 90}', 30, current_timestamp - interval '8 hours'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'tutor_session', '{"subject": "literature analysis", "duration": 45}', 50, current_timestamp - interval '10 hours');

-- Function to quickly reset all seeded data (useful for re-seeding)
CREATE OR REPLACE FUNCTION public.reset_seeded_data()
RETURNS void AS $$
BEGIN
  -- Delete in reverse order of dependencies
  DELETE FROM public.activity_log WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username LIKE '%doe%' OR username LIKE '%smith%' 
    OR username LIKE '%wilson%' OR username LIKE '%brown%' OR username LIKE '%jones%' 
    OR username LIKE '%davis%' OR username LIKE '%miller%' OR username LIKE '%garcia%'
  );
  
  DELETE FROM public.user_daily_progress WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username LIKE '%doe%' OR username LIKE '%smith%' 
    OR username LIKE '%wilson%' OR username LIKE '%brown%' OR username LIKE '%jones%' 
    OR username LIKE '%davis%' OR username LIKE '%miller%' OR username LIKE '%garcia%'
  );
  
  DELETE FROM public.user_achievements WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username LIKE '%doe%' OR username LIKE '%smith%' 
    OR username LIKE '%wilson%' OR username LIKE '%brown%' OR username LIKE '%jones%' 
    OR username LIKE '%davis%' OR username LIKE '%miller%' OR username LIKE '%garcia%'
  );
  
  DELETE FROM public.point_transactions WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username LIKE '%doe%' OR username LIKE '%smith%' 
    OR username LIKE '%wilson%' OR username LIKE '%brown%' OR username LIKE '%jones%' 
    OR username LIKE '%davis%' OR username LIKE '%miller%' OR username LIKE '%garcia%'
  );
  
  DELETE FROM public.profiles WHERE username IN (
    'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 'emmadavis', 'davidmiller', 'lisagarcia'
  );
  
  DELETE FROM auth.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888'
  );
  
  RAISE NOTICE 'All seeded test data has been removed.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a single test user quickly
CREATE OR REPLACE FUNCTION public.create_test_user(
  p_name text,
  p_username text,
  p_email text,
  p_university text DEFAULT 'Test University',
  p_major text DEFAULT 'Computer Science',
  p_points integer DEFAULT 1000
)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  VALUES (user_id, p_email, crypt('password123', gen_salt('bf')), now(), now(), now(), 
    json_build_object('full_name', p_name, 'avatar_url', 'https://avatar.vercel.sh/' || p_username, 'university', p_university));
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, full_name, username, email, university, major, avatar_url,
    total_points, level, experience_points, current_streak, longest_streak, last_activity_date
  ) VALUES (
    user_id, p_name, p_username, p_email, p_university, p_major, 'https://avatar.vercel.sh/' || p_username,
    p_points, public.calculate_level(p_points), p_points, 1, 1, current_date
  );
  
  -- Add some basic point transactions
  INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description)
  VALUES (user_id, p_points, 'earned', 'initial_setup', 'Initial test points');
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Display information about seeded users
DO $$
BEGIN
  RAISE NOTICE '=== StudyPair Test Users Created ===';
  RAISE NOTICE 'Login credentials: password123 for all users';
  RAISE NOTICE '';
  RAISE NOTICE '1. John Doe (johndoe@university.edu) - High achiever with 15,750 points';
  RAISE NOTICE '2. Jane Smith (janesmith@university.edu) - Consistent performer with 8,920 points';
  RAISE NOTICE '3. Alex Wilson (alexwilson@university.edu) - New active user with 2,450 points';
  RAISE NOTICE '4. Sarah Brown (sarahbrown@university.edu) - Medical student with 5,680 points';
  RAISE NOTICE '5. Mike Jones (mikejones@university.edu) - Casual user with 1,120 points';
  RAISE NOTICE '6. Emma Davis (emmadavis@university.edu) - Highly engaged with 12,300 points';
  RAISE NOTICE '7. David Miller (davidmiller@university.edu) - Business focused with 7,890 points';
  RAISE NOTICE '8. Lisa Garcia (lisagarcia@university.edu) - Science enthusiast with 4,320 points';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage:';
  RAISE NOTICE '- SELECT public.reset_seeded_data(); -- to remove all test data';
  RAISE NOTICE '- SELECT public.create_test_user(''Name'', ''username'', ''email@test.com''); -- to create individual user';
  RAISE NOTICE '';
  RAISE NOTICE 'Test the gamification dashboard at: /dashboard';
END $$;
