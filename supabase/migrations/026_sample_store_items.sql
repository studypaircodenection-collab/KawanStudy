-- Add sample store items for testing
-- This migration adds additional store items for the profile customization system

-- First, add the item_data column if it doesn't exist
ALTER TABLE public.store_items ADD COLUMN IF NOT EXISTS item_data jsonb DEFAULT '{}';

-- Insert some border items for testing the restriction
INSERT INTO public.store_items (id, name, description, category, price, image_url, rarity, is_active, item_data) VALUES
('a1234567-1234-1234-1234-123456789009', 'Golden Border', 'A shimmering golden border', 'profile_border', 50, '/images/borders/golden.png', 'rare', true, '{"value": "#FFD700"}'),
('a1234567-1234-1234-1234-123456789010', 'Diamond Border', 'A sparkling diamond border', 'profile_border', 200, '/images/borders/diamond.png', 'epic', true, '{"value": "#B9F2FF"}');

-- Insert some badges
INSERT INTO public.store_items (id, name, description, category, price, image_url, rarity, is_active, item_data) VALUES
('a1234567-1234-1234-1234-123456789011', 'Star Badge', 'A golden star badge', 'profile_badge', 30, '⭐', 'common', true, '{"value": "⭐"}'),
('a1234567-1234-1234-1234-123456789012', 'Crown Badge', 'A royal crown badge', 'profile_badge', 100, '👑', 'rare', true, '{"value": "👑"}');

-- Insert some titles
INSERT INTO public.store_items (id, name, description, category, price, image_url, rarity, is_active, item_data) VALUES
('a1234567-1234-1234-1234-123456789013', 'Study Master', 'A title for dedicated learners', 'profile_title', 150, '/images/titles/study-master.png', 'epic', true, '{"value": "Study Master"}'),
('a1234567-1234-1234-1234-123456789014', 'Knowledge Seeker', 'A title for curious minds', 'profile_title', 75, '/images/titles/knowledge-seeker.png', 'rare', true, '{"value": "Knowledge Seeker"}');

-- Insert some themes
INSERT INTO public.store_items (id, name, description, category, price, image_url, rarity, is_active, item_data) VALUES
('a1234567-1234-1234-1234-123456789015', 'Dark Theme', 'A sleek dark theme for your profile', 'profile_theme', 80, '/images/themes/dark.png', 'rare', true, '{"value": "dark", "colors": {"primary": "#1a1a1a", "secondary": "#333333", "accent": "#8B5CF6"}}'),
('a1234567-1234-1234-1234-123456789016', 'Ocean Theme', 'A calming ocean-inspired theme', 'profile_theme', 120, '/images/themes/ocean.png', 'epic', true, '{"value": "ocean", "colors": {"primary": "#006994", "secondary": "#0080FF", "accent": "#00CED1"}}');

-- Add comment explaining the system
COMMENT ON TABLE public.store_items IS 'Store items for profile customization system.';
