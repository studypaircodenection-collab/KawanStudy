-- DEPRECATED: This file has been split into multiple migration files for better management
-- Please use the files in the migrations/ directory instead:
--
-- 001_profiles.sql - Base profiles table with gamification fields
-- 002_gamification.sql - Gamification system tables and functions  
-- 003_gamification_data.sql - Initial achievements and daily challenges
-- 004_user_data.sql - User data table
--
-- Or run master_schema.sql to execute all migrations at once
--
-- This file is kept for reference but should not be used for new installations

-- To migrate from this old schema, please:
-- 1. Backup your existing data
-- 2. Drop existing tables if needed
-- 3. Run the new migration files in order
-- 4. Restore your data with the new gamification fields set to defaults

-- For new installations, use:
-- \i supabase/master_schema.sql
