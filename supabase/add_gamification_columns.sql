-- add_gamification_columns.sql
-- Add gamification columns to existing profiles table if they don't exist

-- Add gamification columns to profiles table (will skip if they already exist)
DO $$
BEGIN
    -- Add total_points column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'total_points') THEN
        ALTER TABLE public.profiles ADD COLUMN total_points integer DEFAULT 0;
        ALTER TABLE public.profiles ADD CONSTRAINT total_points_positive CHECK (total_points >= 0);
    END IF;

    -- Add current_streak column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'current_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN current_streak integer DEFAULT 0;
        ALTER TABLE public.profiles ADD CONSTRAINT current_streak_positive CHECK (current_streak >= 0);
    END IF;

    -- Add longest_streak column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'longest_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN longest_streak integer DEFAULT 0;
        ALTER TABLE public.profiles ADD CONSTRAINT longest_streak_positive CHECK (longest_streak >= 0);
    END IF;

    -- Add last_activity_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'last_activity_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_activity_date date;
    END IF;

    -- Add level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'level') THEN
        ALTER TABLE public.profiles ADD COLUMN level integer DEFAULT 1;
        ALTER TABLE public.profiles ADD CONSTRAINT level_positive CHECK (level >= 1);
    END IF;

    -- Add experience_points column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'experience_points') THEN
        ALTER TABLE public.profiles ADD COLUMN experience_points integer DEFAULT 0;
        ALTER TABLE public.profiles ADD CONSTRAINT experience_points_positive CHECK (experience_points >= 0);
    END IF;

    RAISE NOTICE 'Gamification columns have been added to profiles table if they were missing.';
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles(last_activity_date);

-- Update existing users to have default gamification values
UPDATE public.profiles 
SET 
    total_points = COALESCE(total_points, 0),
    current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0),
    level = COALESCE(level, 1),
    experience_points = COALESCE(experience_points, 0),
    last_activity_date = COALESCE(last_activity_date, current_date)
WHERE total_points IS NULL 
   OR current_streak IS NULL 
   OR longest_streak IS NULL 
   OR level IS NULL 
   OR experience_points IS NULL 
   OR last_activity_date IS NULL;

RAISE NOTICE 'Updated existing profiles with default gamification values.';
