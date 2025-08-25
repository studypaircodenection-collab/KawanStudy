# Profile Update Feature Documentation

## Overview

The profile update feature allows users to manage their personal and academic information through a comprehensive settings interface. This includes profile picture management, personal details, and academic information with real-time validation and change tracking.

## Components

### 1. ProfileSetting Component (`components/settings/profile-setting.tsx`)

The main React component that provides the user interface for profile management.

**Features:**

- ✅ **Profile Picture Upload**: Upload, change, and remove profile pictures with validation
- ✅ **Real-time Validation**: Instant feedback on form field validation
- ✅ **Change Tracking**: Visual indicators for unsaved changes
- ✅ **Auto-save Integration**: Seamless integration with parent settings page
- ✅ **Progress Indicator**: Shows profile completion percentage
- ✅ **Error Handling**: Comprehensive error display and handling

**Key Sections:**

- **Profile Information**: Basic details (name, email, phone, bio, location)
- **Academic Information**: University, major, year of study
- **Profile Picture Management**: Upload/remove avatar with file validation

### 2. useProfileUpdate Hook (`hooks/use-profile-update.ts`)

Custom React hook that handles all profile update logic and state management.

**Features:**

- ✅ **State Management**: Manages profile data, validation, and loading states
- ✅ **Validation Logic**: Comprehensive form validation with error tracking
- ✅ **API Integration**: Handles API calls for profile updates
- ✅ **Auth Integration**: Syncs with authentication context
- ✅ **File Upload**: Handles profile picture upload with validation
- ✅ **Change Detection**: Tracks modifications for unsaved changes

**Hook API:**

```typescript
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
```

### 3. API Route (`app/api/user/profile/route.ts`)

Backend API endpoint for profile operations.

**Endpoints:**

- `GET /api/user/profile` - Fetch current user profile
- `PUT /api/user/profile` - Update user profile

**Features:**

- ✅ **Authentication**: Supabase auth integration
- ✅ **Validation**: Server-side input validation
- ✅ **Database Integration**: Upsert operations for profile data
- ✅ **Error Handling**: Comprehensive error responses

## Usage

### Basic Implementation

```tsx
import ProfileSetting from "@/components/settings/profile-setting";

function SettingsPage() {
  return (
    <div>
      <ProfileSetting />
    </div>
  );
}
```

### With Custom Hook

```tsx
import { useProfileUpdate } from "@/hooks/use-profile-update";

function CustomProfile() {
  const { profile, hasChanges, updateProfile, saveProfile, errors } =
    useProfileUpdate();

  return (
    <form onSubmit={saveProfile}>
      <input
        value={profile.fullName}
        onChange={(e) => updateProfile("fullName", e.target.value)}
      />
      {errors.fullName && <span>{errors.fullName}</span>}

      {hasChanges && <button type="submit">Save Changes</button>}
    </form>
  );
}
```

## Validation Rules

### Required Fields

- **Full Name**: Minimum 2 characters
- **Username**: Minimum 3 characters, alphanumeric and underscores only
- **Email**: Valid email format

### Optional Fields with Validation

- **Phone**: Valid phone number format (if provided)
- **Bio**: Maximum 500 characters
- **University**: Minimum 2 characters (if provided)
- **Major**: Minimum 2 characters (if provided)

### File Upload Validation

- **Image Types**: JPG, PNG, GIF only
- **File Size**: Maximum 5MB
- **Processing**: Client-side preview with server upload simulation

## State Management

### Profile State Flow

1. **Initialize**: Load profile from auth context
2. **Edit**: Update fields with real-time validation
3. **Validate**: Check all fields before saving
4. **Save**: API call with loading states
5. **Sync**: Update auth context and reset change tracking

### Change Tracking

- Compares current state with original profile
- Shows unsaved changes alert
- Provides reset functionality
- Prevents data loss with confirmation

### Error Handling

- Field-level validation errors
- API error handling with user feedback
- Network error recovery
- File upload error handling

## Integration Points

### Authentication Context

```typescript
// Profile data is synced with auth context
const { claims, setClaims } = useAuth();

// Updates are reflected in claims.user_metadata
setClaims({
  ...claims,
  user_metadata: {
    ...updatedProfileData,
  },
});
```

### Settings Page Integration

```tsx
// Integrated as a tab in main settings
{
  activeTab === "profile" && <ProfileSetting />;
}
```

### Notification System

- Success messages for save operations
- Error notifications for failures
- Progress feedback for uploads
- Change tracking alerts

## API Schema

### Profile Update Request

```typescript
PUT /api/user/profile
{
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
```

### Profile Response

```typescript
{
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
    updated_at: string;
  }
}
```

## Security Considerations

### Input Validation

- Client-side validation for UX
- Server-side validation for security
- Sanitization of user inputs
- File type and size validation

### Authentication

- Supabase auth token validation
- User authorization checks
- Session management
- CSRF protection

### Data Privacy

- Profile visibility controls
- Secure file upload handling
- PII data protection
- Audit logging capabilities

## Performance Optimization

### Client-Side

- Debounced validation for real-time feedback
- Optimistic updates for better UX
- Image compression for avatar uploads
- Form state optimization

### Server-Side

- Efficient database queries
- Upsert operations for performance
- Response caching strategies
- File upload optimization

## Testing

### Unit Tests

```typescript
// Test profile validation
describe("useProfileUpdate", () => {
  it("validates required fields", () => {
    const { validateProfile } = useProfileUpdate();
    // Test validation logic
  });
});
```

### Integration Tests

```typescript
// Test API endpoints
describe("Profile API", () => {
  it("updates profile successfully", async () => {
    // Test API integration
  });
});
```

### E2E Tests

```typescript
// Test complete user flow
describe("Profile Update Flow", () => {
  it("allows user to update profile", () => {
    // Test complete workflow
  });
});
```

## Troubleshooting

### Common Issues

**Validation Errors Not Clearing**

- Ensure `updateProfile` is called when field changes
- Check error state management in hook

**Changes Not Saving**

- Verify API endpoint is accessible
- Check authentication token validity
- Review network requests in DevTools

**Avatar Upload Failing**

- Check file size and type restrictions
- Verify file reader implementation
- Review server upload handling

**Profile Not Loading**

- Check auth context initialization
- Verify API response format
- Review profile data mapping

## Future Enhancements

### Planned Features

1. **Real-time Avatar Cropping**: Image crop tool for profile pictures
2. **Social Media Integration**: Import profile data from social platforms
3. **Profile Sharing**: Generate shareable profile links
4. **Advanced Validation**: Enhanced field validation rules
5. **Profile Templates**: Pre-defined profile templates for different user types
6. **Bulk Import**: CSV import for academic information
7. **Profile Analytics**: Track profile completeness and engagement
8. **Multi-language Support**: Internationalization for profile fields

### Technical Improvements

1. **Optimistic Updates**: Immediate UI updates with rollback on failure
2. **Progressive Enhancement**: Enhanced features for modern browsers
3. **Offline Support**: Service worker for offline profile editing
4. **Real-time Sync**: WebSocket integration for multi-device sync
5. **Advanced Caching**: Intelligent caching strategies
6. **Performance Monitoring**: Profile update performance tracking

---

## Contributing

When contributing to the profile update feature:

1. **Follow TypeScript Conventions**: Maintain strict typing
2. **Test All Changes**: Include unit and integration tests
3. **Update Documentation**: Keep this README current
4. **Accessibility**: Ensure ARIA labels and keyboard navigation
5. **Performance**: Consider impact on loading and rendering times

For questions or contributions, please refer to the main project documentation.
