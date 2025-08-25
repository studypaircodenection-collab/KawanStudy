# Profile Backend System Documentation

## Overview

Comprehensive backend system for handling user profiles in StudyPair, with automatic profile creation on signup for both standard email/password and OAuth (Google) authentication.

## Database Schema

### Profiles Table Structure

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  username text unique,
  email text,
  phone text,
  bio text,
  location text,
  university text,
  year_of_study text,
  major text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Key Features

- **Automatic Profile Creation**: Profiles are automatically created when users sign up
- **Unique Username Generation**: Automatically generates unique usernames
- **OAuth Support**: Works with both Google OAuth and email/password signup
- **Data Validation**: Database-level constraints for data integrity
- **RLS Security**: Row Level Security policies for data protection

## Automatic Profile Creation

### How It Works

1. User signs up via email/password or Google OAuth
2. `handle_new_user()` trigger function executes automatically
3. Profile is created with available user metadata
4. Unique username is generated automatically
5. Default values are set for empty fields

### Data Sources for Profile Creation

#### Standard Email/Password Signup

- `full_name`: Extracted from email prefix if not provided
- `email`: User's email address
- `username`: Generated from full_name or email prefix
- `avatar_url`: Default placeholder image

#### Google OAuth Signup

- `full_name`: From Google profile (`name` or `full_name`)
- `email`: User's Google email
- `username`: Generated from Google name or email
- `avatar_url`: Google profile picture or placeholder
- Additional metadata: Any other data from Google profile

### Username Generation Logic

```sql
-- Automatic username generation rules:
1. Clean base name (remove special chars, lowercase)
2. Limit to 20 characters for counter space
3. Use 'user' as fallback if name is empty
4. Append counter if username exists (user1, user2, etc.)
5. Keep trying until unique username is found
```

## API Endpoints

### Profile Management

```
GET  /api/user/profile          - Get current user's profile
PUT  /api/user/profile          - Update current user's profile
GET  /api/user/username/check   - Check username availability
```

### Profile Update API

**Endpoint**: `PUT /api/user/profile`

**Request Body**:

```json
{
  "full_name": "John Doe",
  "username": "johndoe123",
  "email": "john@example.com",
  "phone": "+1234567890",
  "bio": "Computer Science student",
  "location": "New York, USA",
  "university": "MIT",
  "year_of_study": "3rd Year",
  "major": "Computer Science",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response**:

```json
{
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    // ... other fields
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### Username Availability Check

**Endpoint**: `GET /api/user/username/check?username=johndoe`

**Response**:

```json
{
  "username": "johndoe",
  "available": true,
  "message": "Username is available"
}
```

## Database Functions

### Core Functions

- `handle_new_user()`: Automatically creates profile on user signup
- `generate_unique_username(base_name)`: Generates unique usernames
- `check_username_availability(username)`: Checks if username is available
- `get_profile_by_username(username)`: Retrieves public profile data
- `handle_updated_at()`: Updates timestamp on record changes

### Usage Examples

```sql
-- Check username availability
SELECT public.check_username_availability('johndoe');

-- Get profile by username
SELECT * FROM public.get_profile_by_username('johndoe');

-- Generate unique username
SELECT public.generate_unique_username('John Doe');
```

## Security & Permissions

### Row Level Security (RLS)

- Users can only view/edit their own profiles
- Public profile information (non-sensitive) can be viewed by all users
- Username uniqueness enforced at database level

### RLS Policies

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can view public profile info
CREATE POLICY "Users can view public profile info" ON profiles FOR SELECT USING (true);
```

## Error Handling

### Automatic Profile Creation

- If profile creation fails, user signup still succeeds
- Errors are logged but don't block authentication
- Profiles can be created manually later if needed

### API Error Responses

- Username validation errors
- Duplicate username errors
- Missing required field errors
- Database constraint violations

## Integration Examples

### Frontend Profile Loading

```typescript
// Get current user profile
const response = await fetch("/api/user/profile");
const { profile } = await response.json();

// Check username availability
const checkResponse = await fetch(
  `/api/user/username/check?username=${username}`
);
const { available } = await checkResponse.json();

// Update profile
const updateResponse = await fetch("/api/user/profile", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(profileData),
});
```

### Auth Context Integration

```typescript
// Profile data is automatically available in auth context after signup
const { claims } = useAuth();
const userProfile = {
  fullName: claims?.user_metadata?.full_name,
  username: claims?.user_metadata?.username,
  email: claims?.email,
  // ... other fields
};
```

## Deployment Instructions

### 1. Apply Database Schema

Run the SQL commands in `supabase/schema.sql` in your Supabase SQL editor:

```sql
-- The schema will create:
-- - Updated profiles table with all fields
-- - Automatic profile creation trigger
-- - Username generation functions
-- - RLS policies and security
```

### 2. Update Environment

Ensure your Supabase connection is properly configured in your environment variables.

### 3. Test Profile Creation

1. Create a new user account via signup
2. Verify profile is automatically created
3. Test username uniqueness
4. Test profile updates via API

## Migration from Previous System

### For Existing Users

If you have existing users with the old profile structure:

1. Backup existing profile data
2. Run migration script to add new columns
3. Update existing profiles with default values
4. Test profile update functionality

### Data Migration Script

```sql
-- Add new columns to existing profiles
ALTER TABLE profiles ADD COLUMN username text;
ALTER TABLE profiles ADD COLUMN email text;
-- ... add other new columns

-- Generate usernames for existing users
UPDATE profiles SET username = public.generate_unique_username(full_name || id::text);
```

## Monitoring & Maintenance

### Key Metrics to Monitor

- Profile creation success rate
- Username generation conflicts
- Profile update API performance
- Authentication success rate

### Troubleshooting

- Check trigger function logs for profile creation issues
- Monitor unique constraint violations
- Verify RLS policies are working correctly
- Test OAuth metadata extraction

## Best Practices

### For Frontend Development

- Always validate form data before API calls
- Use username availability check with debouncing
- Handle profile creation edge cases gracefully
- Cache profile data appropriately

### For Backend Development

- Keep profile creation trigger robust with error handling
- Monitor database constraints and indexes
- Use typed interfaces for profile data
- Implement proper API validation

This backend system provides a solid foundation for user profile management with automatic creation, comprehensive data handling, and robust security measures.
