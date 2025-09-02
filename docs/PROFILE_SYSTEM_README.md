# KawanStudy Profile System

A comprehensive user profile management system with automatic profile creation, real-time updates, and seamless authentication integration.

## 📚 Overview

The KawanStudy Profile System provides complete user profile management functionality, including automatic profile creation on signup, comprehensive profile editing, username generation, and secure data handling. It supports both standard email/password and OAuth (Google) authentication with automatic profile provisioning.

## 🚀 Key Features

### Core Functionality

- ✅ **Automatic Profile Creation**: Profiles created automatically on user signup
- ✅ **Unique Username Generation**: Smart username generation with conflict resolution
- ✅ **OAuth Integration**: Full support for Google OAuth and email/password signup
- ✅ **Real-time Validation**: Instant form validation with error feedback
- ✅ **Profile Picture Management**: Upload, change, and remove avatars with validation
- ✅ **Change Tracking**: Visual indicators for unsaved changes with prevention
- ✅ **Auto-save Integration**: Seamless integration with settings interface

### Advanced Features

- 🎯 **Academic Information**: University, major, year of study tracking
- 🔒 **Row Level Security**: Database-level access control
- 📊 **Profile Completion**: Progress indicators and completion tracking
- 🔄 **Data Synchronization**: Auth context integration and real-time sync
- 📱 **Responsive Design**: Mobile-friendly profile management
- 🌐 **Multi-language Support**: Internationalization ready

## 📁 System Architecture

### Database Schema

#### Profiles Table

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

#### Indexes and Constraints

```sql
-- Performance indexes
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_university on public.profiles(university);

-- Unique constraints
alter table profiles add constraint unique_username unique (username);
```

### File Structure

```
├── app/api/user/
│   ├── profile/route.ts         # Profile CRUD operations
│   └── username/
│       └── check/route.ts       # Username availability check
├── components/settings/
│   └── profile-setting.tsx     # Main profile editing component
├── hooks/
│   └── use-profile-update.ts   # Profile management hook
├── lib/services/
│   └── profile.ts              # Profile API client
├── types/
│   └── profile.ts              # TypeScript definitions
└── supabase/
    ├── migrations/
    │   └── 001_profiles.sql    # Database schema
    └── functions/
        ├── handle_new_user.sql # Auto profile creation
        └── username_utils.sql  # Username generation
```

## 🔧 Automatic Profile Creation

### How It Works

The system automatically creates user profiles when users sign up through any authentication method:

1. **User Registration**: User signs up via email/password or Google OAuth
2. **Trigger Execution**: `handle_new_user()` database trigger fires automatically
3. **Profile Creation**: Profile record created with available metadata
4. **Username Generation**: Unique username generated automatically
5. **Default Values**: System populates default values for empty fields

### Data Sources

#### Standard Email/Password Signup

```typescript
// Profile data extracted from signup
{
  full_name: extractedFromEmail || "New User",
  email: userEmail,
  username: generateUniqueUsername(emailPrefix),
  avatar_url: defaultAvatarUrl
}
```

#### Google OAuth Signup

```typescript
// Profile data from Google metadata
{
  full_name: googleProfile.name || googleProfile.full_name,
  email: googleProfile.email,
  username: generateUniqueUsername(googleProfile.name),
  avatar_url: googleProfile.picture || defaultAvatarUrl
}
```

### Username Generation Logic

```sql
-- Smart username generation algorithm:
1. Extract base name from full name or email
2. Clean: remove special characters, convert to lowercase
3. Truncate to 20 characters for counter space
4. Use 'user' as fallback if name is empty
5. Check availability: append counter if username exists (user1, user2, etc.)
6. Keep iterating until unique username is found
7. Return generated unique username
```

## 🛠️ API Reference

### Profile Management

#### Get Current User Profile

```typescript
GET /api/user/profile

Response: {
  profile: {
    id: string;
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
    university?: string;
    year_of_study?: string;
    major?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }
}
```

#### Update User Profile

```typescript
PUT /api/user/profile

Request Body: {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  university?: string;
  year_of_study?: string;
  major?: string;
  avatar_url?: string;
}

Response: {
  profile: ProfileData;
  message: "Profile updated successfully";
}
```

#### Check Username Availability

```typescript
GET /api/user/username/check?username=johndoe

Response: {
  username: string;
  available: boolean;
  message: string;
}
```

## 📝 Frontend Components

### ProfileSetting Component

The main React component providing the profile management interface:

```tsx
import ProfileSetting from "@/components/settings/profile-setting";

function SettingsPage() {
  return (
    <div className="settings-container">
      <ProfileSetting />
    </div>
  );
}
```

#### Component Features

- **Profile Picture Upload**: Drag-and-drop avatar upload with preview
- **Form Sections**: Organized into Personal and Academic information
- **Real-time Validation**: Instant feedback on field validation
- **Change Tracking**: Visual indicators for unsaved changes
- **Progress Indicator**: Shows profile completion percentage
- **Auto-save Integration**: Seamless saving with loading states

### useProfileUpdate Hook

Custom hook handling all profile update logic:

```typescript
import { useProfileUpdate } from "@/hooks/use-profile-update";

function CustomProfile() {
  const {
    profile, // Current profile data
    originalProfile, // Original profile for comparison
    hasChanges, // Boolean indicating unsaved changes
    isLoading, // Loading state for operations
    isSaving, // Saving state for save operations
    errors, // Validation errors object
    uploadingAvatar, // Avatar upload state
    updateProfile, // Function to update profile fields
    validateProfile, // Function to validate all fields
    saveProfile, // Function to save profile changes
    resetProfile, // Function to reset to original values
    uploadAvatar, // Function to upload new avatar
    removeAvatar, // Function to remove current avatar
  } = useProfileUpdate();

  return (
    <form onSubmit={saveProfile}>
      <input
        value={profile.fullName}
        onChange={(e) => updateProfile("fullName", e.target.value)}
        className={errors.fullName ? "error" : ""}
      />
      {errors.fullName && <span className="error">{errors.fullName}</span>}

      {hasChanges && (
        <div className="actions">
          <button type="button" onClick={resetProfile}>
            Reset
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
}
```

## ✅ Validation Rules

### Required Fields

- **Full Name**: Minimum 2 characters, maximum 100 characters
- **Username**: 3-20 characters, alphanumeric and underscores only
- **Email**: Valid email format, unique in system

### Optional Fields with Validation

- **Phone**: Valid international phone number format
- **Bio**: Maximum 500 characters
- **Location**: Minimum 2 characters if provided
- **University**: Minimum 2 characters if provided
- **Major**: Minimum 2 characters if provided
- **Year of Study**: Must be valid academic year format

### File Upload Validation

- **Supported Types**: JPG, PNG, GIF, WebP
- **File Size**: Maximum 5MB
- **Dimensions**: Minimum 100x100px, maximum 2000x2000px
- **Processing**: Client-side preview with server validation

### Client-Side Validation

```typescript
const validateProfile = (profileData: ProfileData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Full name validation
  if (!profileData.fullName || profileData.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  // Username validation
  if (
    !profileData.username ||
    !/^[a-zA-Z0-9_]{3,20}$/.test(profileData.username)
  ) {
    errors.username =
      "Username must be 3-20 characters, letters, numbers, and underscores only";
  }

  // Email validation
  if (
    !profileData.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)
  ) {
    errors.email = "Please enter a valid email address";
  }

  return errors;
};
```

## 🔒 Security & Permissions

### Row Level Security (RLS)

The system implements comprehensive database-level security:

```sql
-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Public profile information can be viewed by all users
create policy "Users can view public profile info"
  on profiles for select
  using (true);

-- Only system can insert profiles (via trigger)
create policy "System can insert profiles"
  on profiles for insert
  with check (auth.uid() = id);
```

### Data Privacy

- **Profile Visibility**: Granular control over profile information visibility
- **Secure File Upload**: Server-side validation and secure storage
- **PII Protection**: Personal information encrypted and secured
- **Audit Logging**: Comprehensive logging of profile changes

### Authentication Integration

```typescript
// Profile data synchronized with auth context
const { user, claims, setClaims } = useAuth();

// Updates reflected in authentication metadata
const updateAuthClaims = (profileData: ProfileData) => {
  setClaims({
    ...claims,
    user_metadata: {
      ...claims.user_metadata,
      full_name: profileData.fullName,
      username: profileData.username,
      avatar_url: profileData.avatarUrl,
    },
  });
};
```

## 📊 Database Functions

### Core Functions

#### Automatic Profile Creation

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    public.generate_unique_username(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://via.placeholder.com/150')
  );
  return new;
end;
$$ language plpgsql security definer;
```

#### Username Generation

```sql
create or replace function public.generate_unique_username(base_name text)
returns text as $$
declare
  clean_name text;
  final_username text;
  counter integer := 1;
begin
  -- Clean the base name
  clean_name := lower(regexp_replace(coalesce(base_name, 'user'), '[^a-zA-Z0-9]', '', 'g'));

  -- Ensure minimum length and truncate if too long
  if length(clean_name) < 3 then
    clean_name := 'user';
  end if;

  clean_name := left(clean_name, 20);
  final_username := clean_name;

  -- Check for uniqueness and append counter if needed
  while exists (select 1 from profiles where username = final_username) loop
    final_username := left(clean_name, 20 - length(counter::text)) || counter::text;
    counter := counter + 1;
  end loop;

  return final_username;
end;
$$ language plpgsql;
```

#### Username Availability Check

```sql
create or replace function public.check_username_availability(username_to_check text)
returns boolean as $$
begin
  return not exists (
    select 1 from profiles
    where username = username_to_check
  );
end;
$$ language plpgsql security definer;
```

## 🎯 Usage Examples

### Basic Profile Update

```typescript
// Using the profile update hook
import { useProfileUpdate } from "@/hooks/use-profile-update";

function ProfileForm() {
  const { profile, updateProfile, saveProfile, hasChanges, errors } =
    useProfileUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveProfile();
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Full Name</label>
        <input
          value={profile.fullName}
          onChange={(e) => updateProfile("fullName", e.target.value)}
        />
        {errors.fullName && <span>{errors.fullName}</span>}
      </div>

      <div>
        <label>Username</label>
        <input
          value={profile.username}
          onChange={(e) => updateProfile("username", e.target.value)}
        />
        {errors.username && <span>{errors.username}</span>}
      </div>

      {hasChanges && <button type="submit">Save Changes</button>}
    </form>
  );
}
```

### Avatar Upload

```typescript
// Profile picture upload example
const handleAvatarUpload = async (file: File) => {
  try {
    const result = await uploadAvatar(file);
    if (result.success) {
      toast.success("Profile picture updated!");
    }
  } catch (error) {
    toast.error("Failed to upload profile picture");
  }
};

// Avatar component with upload
<div className="avatar-section">
  <img src={profile.avatarUrl} alt="Profile" />
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      e.target.files?.[0] && handleAvatarUpload(e.target.files[0])
    }
  />
  {profile.avatarUrl && <button onClick={removeAvatar}>Remove Picture</button>}
</div>;
```

### Username Availability Check

```typescript
// Real-time username validation
import { debounce } from "lodash";

const checkUsernameAvailability = debounce(async (username: string) => {
  if (username.length < 3) return;

  const response = await fetch(`/api/user/username/check?username=${username}`);
  const { available } = await response.json();

  if (!available) {
    setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
  } else {
    setErrors((prev) => ({ ...prev, username: undefined }));
  }
}, 500);

// Usage in component
useEffect(() => {
  if (profile.username !== originalProfile.username) {
    checkUsernameAvailability(profile.username);
  }
}, [profile.username]);
```

## 📈 Performance Optimization

### Client-Side Optimization

- **Debounced Validation**: Real-time validation with 500ms debounce
- **Optimistic Updates**: Immediate UI updates with rollback capability
- **Image Compression**: Client-side image compression before upload
- **Form State Optimization**: Efficient state management with minimal re-renders

### Server-Side Optimization

```typescript
// Efficient database queries with prepared statements
const updateProfile = async (userId: string, profileData: ProfileData) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
};
```

### Caching Strategy

- **Profile Data**: Cache user profile in auth context
- **Username Checks**: Cache recent username availability checks
- **Avatar URLs**: CDN caching for profile pictures
- **Database Queries**: Query result caching for frequent operations

## 🧪 Testing

### Unit Tests

```typescript
// Profile validation tests
describe("Profile Validation", () => {
  it("validates required fields correctly", () => {
    const errors = validateProfile({
      fullName: "Jo", // Too short
      username: "ab", // Too short
      email: "invalid-email",
    });

    expect(errors.fullName).toBeDefined();
    expect(errors.username).toBeDefined();
    expect(errors.email).toBeDefined();
  });

  it("accepts valid profile data", () => {
    const errors = validateProfile({
      fullName: "John Doe",
      username: "johndoe123",
      email: "john@example.com",
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });
});
```

### Integration Tests

```typescript
// API endpoint tests
describe("Profile API", () => {
  it("updates profile successfully", async () => {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validProfileData),
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.profile).toBeDefined();
  });

  it("checks username availability", async () => {
    const response = await fetch("/api/user/username/check?username=testuser");
    const result = await response.json();

    expect(result.available).toBeDefined();
    expect(typeof result.available).toBe("boolean");
  });
});
```

### E2E Tests

```typescript
// Complete user flow tests
describe("Profile Management Flow", () => {
  it("allows complete profile update workflow", async () => {
    // Navigate to profile settings
    await page.goto("/settings?tab=profile");

    // Update profile information
    await page.fill('[name="fullName"]', "Test User Updated");
    await page.fill('[name="bio"]', "Updated bio information");

    // Save changes
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator(".success-message")).toBeVisible();
    await expect(page.locator('[name="fullName"]')).toHaveValue(
      "Test User Updated"
    );
  });
});
```

## 🚨 Error Handling

### Common Error Scenarios

#### Username Conflicts

```typescript
// Handle username already taken
{
  "error": "Username already exists",
  "code": "USERNAME_TAKEN",
  "field": "username",
  "suggestions": ["johndoe1", "johndoe2", "john_doe"]
}
```

#### Validation Errors

```typescript
// Field validation failures
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "fields": {
    "fullName": "Full name must be at least 2 characters",
    "email": "Please enter a valid email address"
  }
}
```

#### Upload Errors

```typescript
// File upload issues
{
  "error": "File upload failed",
  "code": "UPLOAD_ERROR",
  "details": "File size exceeds 5MB limit"
}
```

### Error Recovery

```typescript
// Comprehensive error handling
const handleProfileUpdate = async (profileData: ProfileData) => {
  try {
    setSaving(true);
    const result = await saveProfile(profileData);

    if (!result.success) {
      throw new Error(result.error);
    }

    toast.success("Profile updated successfully!");
  } catch (error) {
    if (error.code === "USERNAME_TAKEN") {
      setErrors((prev) => ({
        ...prev,
        username: "Username is already taken",
      }));
    } else if (error.code === "VALIDATION_ERROR") {
      setErrors(error.fields);
    } else {
      toast.error("Failed to update profile. Please try again.");
    }
  } finally {
    setSaving(false);
  }
};
```

## 🔮 Future Enhancements

### Planned Features

- 📱 **Mobile App Integration**: React Native profile management
- 🤖 **AI Profile Suggestions**: Smart profile completion suggestions
- 📊 **Profile Analytics**: Track profile engagement and completeness
- 🎮 **Gamification**: Profile completion rewards and badges
- 🔄 **Social Integration**: Import data from LinkedIn, Twitter, etc.
- 👥 **Profile Sharing**: Generate shareable profile pages
- 📚 **Academic Verification**: University email verification system
- 🌐 **Multi-language Profiles**: Support for multiple languages

### Technical Improvements

- **Real-time Sync**: WebSocket integration for multi-device sync
- **Advanced Caching**: Redis integration for better performance
- **Progressive Enhancement**: Enhanced features for modern browsers
- **Offline Support**: Service worker for offline profile editing
- **Advanced Search**: ElasticSearch for profile discovery
- **Analytics Integration**: Profile interaction tracking
- **A/B Testing**: Profile form optimization
- **Performance Monitoring**: Real-time performance tracking

### Migration Tools

- **Bulk Import**: CSV/Excel profile data import
- **Data Export**: Profile data export functionality
- **Legacy Migration**: Tools for migrating from old systems
- **Backup/Restore**: Automated profile backup systems

## 📞 Support & Troubleshooting

### Common Issues

**Profile Not Creating Automatically**

- Check if `handle_new_user()` trigger is properly installed
- Verify Supabase function permissions
- Review authentication flow logs

**Username Generation Failing**

- Ensure `generate_unique_username()` function exists
- Check for database constraint violations
- Verify username uniqueness index

**Profile Updates Not Saving**

- Verify authentication token validity
- Check RLS policies are correctly configured
- Review API endpoint authentication

**Avatar Upload Issues**

- Check file size and type restrictions
- Verify storage bucket permissions
- Review upload endpoint configuration

### Debugging Tools

```typescript
// Enable debug logging
const DEBUG_PROFILE = process.env.NODE_ENV === "development";

const debugLog = (message: string, data?: any) => {
  if (DEBUG_PROFILE) {
    console.log(`[Profile Debug] ${message}`, data);
  }
};

// Usage in components
debugLog("Profile update initiated", { profileData, hasChanges });
```

### Performance Monitoring

```typescript
// Track profile update performance
const trackProfileUpdate = async (updateData: ProfileData) => {
  const startTime = performance.now();

  try {
    const result = await updateProfile(updateData);
    const endTime = performance.now();

    // Log performance metrics
    analytics.track("profile_update_success", {
      duration: endTime - startTime,
      fields_updated: Object.keys(updateData).length,
    });

    return result;
  } catch (error) {
    analytics.track("profile_update_error", {
      error: error.message,
      duration: performance.now() - startTime,
    });
    throw error;
  }
};
```

## 📚 Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Testing**: Minimum 80% code coverage for profile-related code
- **Documentation**: JSDoc comments for all public functions
- **Accessibility**: ARIA labels and keyboard navigation support

### Contribution Workflow

1. **Fork Repository**: Create feature branch from main
2. **Write Tests**: Include unit and integration tests
3. **Update Documentation**: Keep this README current
4. **Code Review**: Submit PR with clear description
5. **Testing**: Ensure all tests pass in CI/CD

### Best Practices

- **Security First**: Always validate input on both client and server
- **User Experience**: Provide clear feedback for all actions
- **Performance**: Optimize for fast loading and smooth interactions
- **Accessibility**: Ensure compatibility with screen readers
- **Mobile First**: Design for mobile devices primarily

---

**Last Updated**: September 2025  
**Version**: 2.0.0  
**Maintainer**: KawanStudy Development Team

For technical support or feature requests, please contact the development team or submit an issue in the project repository.
