-- seeder.sql
-- Comprehensive test data seeder for StudyPair
-- This file creates sample users with realistic data for testing:
-- - User profiles with gamification stats
-- - Peer connections (accepted, pending, blocked)
-- - Gamification features (points, achievements, challenges)
-- - Activity logs and point transactions

-- Note: This seeder assumes you have all systems set up (profiles, gamification, peer connections)
-- Run this after executing all migrations

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
   '{"full_name": "Lisa Garcia", "avatar_url": "https://avatar.vercel.sh/lisa", "university": "Science University"}'),
  ('99999999-9999-9999-9999-999999999999'::uuid, 'tom.wilson@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Tom Wilson", "avatar_url": "https://avatar.vercel.sh/tom", "university": "Research University"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'anna.lee@university.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 
   '{"full_name": "Anna Lee", "avatar_url": "https://avatar.vercel.sh/anna", "university": "Arts College"}')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users with varied gamification stats and online status
INSERT INTO public.profiles (
  id, full_name, username, email, bio, location, university, year_of_study, major, avatar_url,
  total_points, current_streak, longest_streak, level, experience_points, last_activity_date,
  is_online, last_seen
) VALUES 
  -- John Doe - High achiever, currently online
  ('11111111-1111-1111-1111-111111111111'::uuid, 'John Doe', 'johndoe', 'john.doe@university.edu', 
   'Computer Science student passionate about algorithms and data structures. Always happy to help!', 'San Francisco, CA', 
   'University of Technology', '3rd Year', 'Computer Science', 'https://avatar.vercel.sh/john',
   15750, 25, 30, 13, 15750, current_date, true, now()),

  -- Jane Smith - Consistent performer, recently online
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Jane Smith', 'janesmith', 'jane.smith@university.edu',
   'Math major who loves tutoring others and solving complex problems. Study group enthusiast!', 'Boston, MA',
   'State University', '4th Year', 'Mathematics', 'https://avatar.vercel.sh/jane',
   8920, 12, 45, 10, 8920, current_date, false, now() - interval '30 minutes'),

  -- Alex Wilson - New but active, currently online
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Alex Wilson', 'alexwilson', 'alex.wilson@university.edu',
   'Engineering student interested in renewable energy and sustainability. New to the platform!', 'Austin, TX',
   'Tech Institute', '2nd Year', 'Mechanical Engineering', 'https://avatar.vercel.sh/alex',
   2450, 8, 8, 5, 2450, current_date, true, now()),

  -- Sarah Brown - Medical student, offline
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Sarah Brown', 'sarahbrown', 'sarah.brown@university.edu',
   'Pre-med student focused on biology and chemistry studies. Looking for study partners!', 'Chicago, IL',
   'Medical College', '1st Year', 'Biology', 'https://avatar.vercel.sh/sarah',
   5680, 15, 20, 8, 5680, current_date, false, now() - interval '2 hours'),

  -- Mike Jones - Casual user, offline for a day
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Mike Jones', 'mikejones', 'mike.jones@university.edu',
   'Business student balancing studies with part-time work. Available evenings for study sessions.', 'Seattle, WA',
   'Engineering School', '3rd Year', 'Civil Engineering', 'https://avatar.vercel.sh/mike',
   1120, 3, 7, 4, 1120, current_date - interval '1 day', false, now() - interval '1 day'),

  -- Emma Davis - Highly engaged, currently online
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Emma Davis', 'emmadavis', 'emma.davis@university.edu',
   'Literature student with a passion for creative writing and analysis. Love peer discussions!', 'Portland, OR',
   'Liberal Arts College', '2nd Year', 'English Literature', 'https://avatar.vercel.sh/emma',
   12300, 20, 35, 11, 12300, current_date, true, now()),

  -- David Miller - Business focused, recently offline
  ('77777777-7777-7777-7777-777777777777'::uuid, 'David Miller', 'davidmiller', 'david.miller@university.edu',
   'MBA student specializing in entrepreneurship and innovation. Always networking!', 'New York, NY',
   'Business School', 'Graduate', 'Business Administration', 'https://avatar.vercel.sh/david',
   7890, 5, 15, 9, 7890, current_date, false, now() - interval '1 hour'),

  -- Lisa Garcia - Science enthusiast, offline
  ('88888888-8888-8888-8888-888888888888'::uuid, 'Lisa Garcia', 'lisagarcia', 'lisa.garcia@university.edu',
   'Physics student researching quantum mechanics and particle physics. Love explaining concepts!', 'Los Angeles, CA',
   'Science University', '4th Year', 'Physics', 'https://avatar.vercel.sh/lisa',
   4320, 7, 12, 7, 4320, current_date, false, now() - interval '4 hours'),

  -- Tom Wilson - Additional user for connection variety
  ('99999999-9999-9999-9999-999999999999'::uuid, 'Tom Wilson', 'tomwilson', 'tom.wilson@university.edu',
   'Chemistry student working on research projects. Open to collaboration!', 'Denver, CO',
   'Research University', '3rd Year', 'Chemistry', 'https://avatar.vercel.sh/tom',
   3200, 6, 10, 6, 3200, current_date, false, now() - interval '6 hours'),

  -- Anna Lee - Another user for testing
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Anna Lee', 'annalee', 'anna.lee@university.edu',
   'Art History student with interests in digital humanities. Love interdisciplinary studies!', 'Miami, FL',
   'Arts College', '4th Year', 'Art History', 'https://avatar.vercel.sh/anna',
   6750, 11, 18, 9, 6750, current_date, true, now())
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

-- Emma Davis - Highly engaged
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('66666666-6666-6666-6666-666666666666'::uuid, 50, 'earned', 'tutor_session', 'Literature analysis session', current_date - interval '1 day'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 25, 'earned', 'class_join', 'Joined creative writing group', current_date - interval '2 days'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 30, 'earned', 'study_session', 'Extended reading session', current_date - interval '3 days');

-- Additional users point transactions
INSERT INTO public.point_transactions (user_id, points, transaction_type, source, description, created_at) VALUES
  ('99999999-9999-9999-9999-999999999999'::uuid, 25, 'earned', 'class_join', 'Joined chemistry lab group', current_date - interval '1 day'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 40, 'earned', 'tutor_session', 'Art history presentation', current_date - interval '2 days');

-- ============================================================================
-- PEER CONNECTIONS DATA
-- ============================================================================

-- Create realistic peer connections with different statuses
INSERT INTO public.peer_connections (requester_id, addressee_id, status, message, created_at, updated_at) VALUES

-- ACCEPTED CONNECTIONS (Friends)
-- John Doe connections
('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'accepted', 'Hey Jane! Would love to study together sometime.', current_date - interval '5 days', current_date - interval '4 days'),
('11111111-1111-1111-1111-111111111111'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'accepted', 'Hi Emma! Interested in interdisciplinary collaboration.', current_date - interval '7 days', current_date - interval '6 days'),
('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'accepted', 'John, could use help with programming concepts!', current_date - interval '3 days', current_date - interval '2 days'),

-- Jane Smith connections
('22222222-2222-2222-2222-222222222222'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'accepted', 'Sarah, happy to help with math prerequisites!', current_date - interval '6 days', current_date - interval '5 days'),
('88888888-8888-8888-8888-888888888888'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'accepted', 'Jane, need help with statistical analysis.', current_date - interval '4 days', current_date - interval '3 days'),

-- Emma Davis connections
('66666666-6666-6666-6666-666666666666'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'accepted', 'Anna! Fellow humanities student here.', current_date - interval '8 days', current_date - interval '7 days'),
('77777777-7777-7777-7777-777777777777'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'accepted', 'Emma, interested in creative business ideas!', current_date - interval '5 days', current_date - interval '4 days'),

-- Additional cross-connections
('44444444-4444-4444-4444-444444444444'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'accepted', 'Tom, chemistry is related to biology!', current_date - interval '9 days', current_date - interval '8 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'accepted', 'David, art meets business!', current_date - interval '6 days', current_date - interval '5 days'),

-- PENDING CONNECTIONS (Waiting for response)
-- Incoming requests (these users will see them in "Requests" tab)
('33333333-3333-3333-3333-333333333333'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'pending', 'Jane, would love to get math tutoring!', current_date - interval '2 days', current_date - interval '2 days'),
('55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'pending', 'John, heard you''re great at CS concepts.', current_date - interval '1 day', current_date - interval '1 day'),
('99999999-9999-9999-9999-999999999999'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'pending', 'Emma, interested in writing about science!', current_date - interval '3 days', current_date - interval '3 days'),

-- Outgoing requests (these users will see them in "Sent" tab)
('22222222-2222-2222-2222-222222222222'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'pending', 'Lisa, would love to discuss math applications in physics!', current_date - interval '2 days', current_date - interval '2 days'),
('66666666-6666-6666-6666-666666666666'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'pending', 'Mike, interested in interdisciplinary projects.', current_date - interval '1 day', current_date - interval '1 day'),

-- BLOCKED CONNECTIONS
-- These will appear in "Blocked" tab for the respective users
('77777777-7777-7777-7777-777777777777'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'blocked', NULL, current_date - interval '10 days', current_date - interval '9 days'),
('88888888-8888-8888-8888-888888888888'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'blocked', NULL, current_date - interval '12 days', current_date - interval '11 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'blocked', NULL, current_date - interval '8 days', current_date - interval '7 days')

ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- Award achievements based on their stats
INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
SELECT u.id, a.id, current_date - interval '5 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'johndoe' AND a.name IN ('rookie', 'rising_star', 'scholar', 'expert', 'master', 'consistent', 'dedicated', 'committed')
UNION ALL
SELECT u.id, a.id, current_date - interval '3 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'janesmith' AND a.name IN ('rookie', 'rising_star', 'scholar', 'expert', 'consistent', 'dedicated')
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
UNION ALL
SELECT u.id, a.id, current_date - interval '6 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'mikejones' AND a.name IN ('rookie', 'rising_star')
UNION ALL
SELECT u.id, a.id, current_date - interval '4 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'davidmiller' AND a.name IN ('rookie', 'rising_star', 'scholar', 'consistent')
UNION ALL
SELECT u.id, a.id, current_date - interval '3 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'lisagarcia' AND a.name IN ('rookie', 'rising_star', 'scholar')
UNION ALL
SELECT u.id, a.id, current_date - interval '2 days'
FROM public.profiles u, public.achievements a
WHERE u.username = 'tomwilson' AND a.name IN ('rookie', 'rising_star', 'consistent')
UNION ALL
SELECT u.id, a.id, current_date - interval '1 day'
FROM public.profiles u, public.achievements a
WHERE u.username = 'annalee' AND a.name IN ('rookie', 'rising_star', 'scholar', 'consistent')
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Add some daily challenge progress for current date
INSERT INTO public.user_daily_progress (user_id, challenge_id, current_progress, is_completed, completed_at)
SELECT 
  p.id as user_id,
  dc.id as challenge_id,
  CASE 
    WHEN dc.name = 'daily_login' THEN 1
    WHEN dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown', 'alexwilson') THEN 1
    WHEN dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis', 'annalee') THEN 1
    WHEN dc.name = 'update_profile' AND p.username IN ('tomwilson', 'davidmiller') THEN 1
    ELSE 0
  END as current_progress,
  CASE 
    WHEN dc.name = 'daily_login' THEN true
    WHEN dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown', 'alexwilson') THEN true
    WHEN dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis', 'annalee') THEN true
    WHEN dc.name = 'update_profile' AND p.username IN ('tomwilson', 'davidmiller') THEN true
    ELSE false
  END as is_completed,
  CASE 
    WHEN dc.name = 'daily_login' OR 
         (dc.name = 'complete_quiz' AND p.username IN ('johndoe', 'janesmith', 'sarahbrown', 'alexwilson')) OR
         (dc.name = 'join_class' AND p.username IN ('johndoe', 'emmadavis', 'annalee')) OR
         (dc.name = 'update_profile' AND p.username IN ('tomwilson', 'davidmiller'))
    THEN now()
    ELSE null
  END as completed_at
FROM public.profiles p
CROSS JOIN public.daily_challenges dc
WHERE dc.name IN ('daily_login', 'complete_quiz', 'join_class', 'update_profile')
AND p.username IN ('johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'emmadavis', 'mikejones', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee')
ON CONFLICT (user_id, challenge_id, progress_date) DO NOTHING;

-- Add comprehensive activity logs to show recent activities
INSERT INTO public.activity_log (user_id, activity_type, activity_data, points_earned, created_at) VALUES
  -- Recent peer connection activities
  ('11111111-1111-1111-1111-111111111111'::uuid, 'peer_connect', '{"connected_with": "Alex Wilson", "connection_type": "accepted"}', 10, current_timestamp - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'peer_connect', '{"connected_with": "John Doe", "connection_type": "accepted"}', 10, current_timestamp - interval '2 hours'),
  
  -- Study and tutoring activities
  ('11111111-1111-1111-1111-111111111111'::uuid, 'tutor_session', '{"subject": "algorithms", "duration": 90, "student": "Alex Wilson"}', 50, current_timestamp - interval '4 hours'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'quiz', '{"subject": "linear algebra", "score": 95, "time_taken": 45}', 15, current_timestamp - interval '6 hours'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'class_join', '{"group": "renewable energy discussion", "type": "study_group"}', 25, current_timestamp - interval '8 hours'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'study_session', '{"subject": "organic chemistry", "duration": 120, "type": "solo"}', 30, current_timestamp - interval '10 hours'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'tutor_session', '{"subject": "creative writing", "duration": 60, "student": "David Miller"}', 50, current_timestamp - interval '12 hours'),
  
  -- Connection request activities
  ('55555555-5555-5555-5555-555555555555'::uuid, 'peer_request', '{"requested": "John Doe", "message_sent": true}', 5, current_timestamp - interval '1 day'),
  ('99999999-9999-9999-9999-999999999999'::uuid, 'peer_request', '{"requested": "Emma Davis", "message_sent": true}', 5, current_timestamp - interval '1 day'),
  
  -- Gamification activities
  ('22222222-2222-2222-2222-222222222222'::uuid, 'achievement_earned', '{"achievement": "Consistent Learner", "level": "dedicated"}', 100, current_timestamp - interval '1 day'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'level_up', '{"old_level": 8, "new_level": 9, "points_required": 6750}', 50, current_timestamp - interval '2 days'),
  
  -- Cross-disciplinary collaboration
  ('77777777-7777-7777-7777-777777777777'::uuid, 'collaboration', '{"project": "business-arts fusion", "partner": "Anna Lee"}', 40, current_timestamp - interval '3 days'),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'research_session', '{"topic": "quantum mechanics", "duration": 180}', 60, current_timestamp - interval '4 days'),
  
  -- Daily challenge completions
  ('99999999-9999-9999-9999-999999999999'::uuid, 'daily_challenge', '{"challenge": "update_profile", "completed": true}', 20, current_timestamp - interval '5 hours'),
  ('77777777-7777-7777-7777-777777777777'::uuid, 'daily_challenge', '{"challenge": "join_class", "completed": true}', 20, current_timestamp - interval '7 hours');

-- Function to quickly reset all seeded data (useful for re-seeding)
CREATE OR REPLACE FUNCTION public.reset_seeded_data()
RETURNS void AS $$
BEGIN
  -- Delete in reverse order of dependencies
  DELETE FROM public.activity_log WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  );
  
  DELETE FROM public.user_daily_progress WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  );
  
  DELETE FROM public.user_achievements WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  );
  
  DELETE FROM public.peer_connections WHERE requester_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  ) OR addressee_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  );
  
  DELETE FROM public.point_transactions WHERE user_id IN (
    SELECT id FROM public.profiles WHERE username IN (
      'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
      'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
    )
  );
  
  DELETE FROM public.profiles WHERE username IN (
    'johndoe', 'janesmith', 'alexwilson', 'sarahbrown', 'mikejones', 
    'emmadavis', 'davidmiller', 'lisagarcia', 'tomwilson', 'annalee'
  );
  
  DELETE FROM auth.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
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

-- Display information about seeded users and their connections
DO $$
BEGIN
  RAISE NOTICE '=== StudyPair Comprehensive Test Data Created ===';
  RAISE NOTICE 'Login credentials: password123 for all users';
  RAISE NOTICE '';
  RAISE NOTICE '📚 USER PROFILES & GAMIFICATION:';
  RAISE NOTICE '1. John Doe (johndoe) - High achiever, 15,750 pts, Level 13, ONLINE';
  RAISE NOTICE '   Connected to: Jane Smith, Emma Davis, Alex Wilson';
  RAISE NOTICE '   Pending requests from: Mike Jones';
  RAISE NOTICE '';
  RAISE NOTICE '2. Jane Smith (janesmith) - Consistent performer, 8,920 pts, Level 10';
  RAISE NOTICE '   Connected to: John Doe, Sarah Brown, Lisa Garcia';
  RAISE NOTICE '   Pending requests from: Alex Wilson';
  RAISE NOTICE '   Sent request to: Lisa Garcia';
  RAISE NOTICE '';
  RAISE NOTICE '3. Alex Wilson (alexwilson) - New active user, 2,450 pts, Level 5, ONLINE';
  RAISE NOTICE '   Connected to: John Doe';
  RAISE NOTICE '   Sent request to: Jane Smith';
  RAISE NOTICE '   Blocked by: Lisa Garcia';
  RAISE NOTICE '';
  RAISE NOTICE '4. Sarah Brown (sarahbrown) - Medical student, 5,680 pts, Level 8';
  RAISE NOTICE '   Connected to: Jane Smith, Tom Wilson';
  RAISE NOTICE '';
  RAISE NOTICE '5. Mike Jones (mikejones) - Casual user, 1,120 pts, Level 4';
  RAISE NOTICE '   Sent request to: John Doe';
  RAISE NOTICE '   Blocked by: David Miller';
  RAISE NOTICE '';
  RAISE NOTICE '6. Emma Davis (emmadavis) - Highly engaged, 12,300 pts, Level 11, ONLINE';
  RAISE NOTICE '   Connected to: John Doe, Anna Lee, David Miller';
  RAISE NOTICE '   Pending requests from: Tom Wilson';
  RAISE NOTICE '   Sent request to: Mike Jones';
  RAISE NOTICE '';
  RAISE NOTICE '7. David Miller (davidmiller) - Business focused, 7,890 pts, Level 9';
  RAISE NOTICE '   Connected to: Emma Davis, Anna Lee';
  RAISE NOTICE '   Blocked: Mike Jones';
  RAISE NOTICE '';
  RAISE NOTICE '8. Lisa Garcia (lisagarcia) - Science enthusiast, 4,320 pts, Level 7';
  RAISE NOTICE '   Connected to: Jane Smith';
  RAISE NOTICE '   Blocked: Alex Wilson';
  RAISE NOTICE '';
  RAISE NOTICE '9. Tom Wilson (tomwilson) - Chemistry student, 3,200 pts, Level 6';
  RAISE NOTICE '   Connected to: Sarah Brown';
  RAISE NOTICE '   Sent request to: Emma Davis';
  RAISE NOTICE '   Blocked by: Anna Lee';
  RAISE NOTICE '';
  RAISE NOTICE '10. Anna Lee (annalee) - Art History student, 6,750 pts, Level 9, ONLINE';
  RAISE NOTICE '    Connected to: Emma Davis, David Miller';
  RAISE NOTICE '    Blocked: Tom Wilson';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 GAMIFICATION FEATURES:';
  RAISE NOTICE '- All users have realistic point transactions and achievements';
  RAISE NOTICE '- Daily challenges with varied completion status';
  RAISE NOTICE '- Activity logs showing recent peer and study activities';
  RAISE NOTICE '- Online status tracking (4 users currently online)';
  RAISE NOTICE '';
  RAISE NOTICE '👥 PEER CONNECTION TESTING:';
  RAISE NOTICE '- 9 Accepted connections (Friends tab)';
  RAISE NOTICE '- 5 Pending requests (Requests & Sent tabs)';
  RAISE NOTICE '- 3 Blocked relationships (Blocked tab)';
  RAISE NOTICE '- Discovery tab will show users without existing connections';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 UTILITY FUNCTIONS:';
  RAISE NOTICE '- SELECT public.reset_seeded_data(); -- Remove all test data';
  RAISE NOTICE '- SELECT public.create_test_user(''Name'', ''username'', ''email@test.com''); -- Create individual user';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 TEST SCENARIOS:';
  RAISE NOTICE '- Login as any user to test peer discovery, connection management';
  RAISE NOTICE '- Test gamification features, achievements, daily challenges';
  RAISE NOTICE '- Verify online status, search functionality, blocking/unblocking';
  RAISE NOTICE '- Navigate to /dashboard/peer to explore all peer features';
END $$;
