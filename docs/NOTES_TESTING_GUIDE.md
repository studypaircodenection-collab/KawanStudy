# Notes System Test Script

## Manual Testing Steps

### 1. Test Upload Functionality

1. Navigate to `http://localhost:3001/dashboard/notes/upload`
2. Fill in required fields:
   - Title: "Test Note Upload"
   - Subject: "Computer Science"
   - Academic Level: "Undergraduate"
   - Note Type: "Lecture Notes"
3. Choose between PDF upload or text content
4. Submit and verify success message

### 2. Test Browse Functionality

1. Navigate to `http://localhost:3001/dashboard/notes`
2. Verify notes are displayed in grid
3. Test search functionality
4. Test filters (subject, academic level, etc.)
5. Test sorting options

### 3. Test Note Detail View

1. Click on any note card
2. Verify note details display correctly
3. Test like functionality
4. Test download functionality (if PDF)
5. Verify view count increments

### 4. Database Verification

Check in Supabase dashboard:

- Notes table has entries
- Storage bucket contains uploaded files
- Point transactions recorded for uploads
- View counts updated properly

### 5. API Testing

Use browser developer tools or Postman:

```bash
# Get public notes
GET http://localhost:3001/api/notes

# Get specific note
GET http://localhost:3001/api/notes/{note-id}

# Like a note (requires auth)
POST http://localhost:3001/api/notes/{note-id}/actions
Content-Type: application/json
{
  "action": "like"
}
```

### Expected Results

- ✅ File uploads work correctly
- ✅ Database entries created
- ✅ Search and filtering functional
- ✅ Like system works
- ✅ Download tracking works
- ✅ View counting works
- ✅ Gamification points awarded
- ✅ RLS policies enforce security

### Common Issues & Solutions

**Upload fails:**

- Check file size (max 10MB)
- Verify PDF format
- Check Supabase storage configuration

**Search returns no results:**

- Verify database has notes with status 'published'
- Check visibility is set to 'public'

**Authentication errors:**

- Ensure user is logged in
- Check Supabase auth configuration

**File access denied:**

- Verify storage bucket policies
- Check file paths in database match storage

This completes the comprehensive testing of the notes system implementation.
