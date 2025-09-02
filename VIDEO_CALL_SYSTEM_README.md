# StudyPair Video Call System

## Overview

StudyPair now includes a comprehensive video calling system built using WebRTC technology, based on the WebDevSimplified Zoom Clone architecture but using Supabase for database management instead of Socket.IO.

## Features

- **Instant Room Creation**: Create video rooms with unique IDs instantly
- **Join Existing Rooms**: Join rooms using room IDs shared by others
- **WebRTC Technology**: High-quality peer-to-peer video calls
- **Multi-participant Support**: Support for multiple users in a single room
- **Real-time Signaling**: Uses Supabase real-time channels for WebRTC signaling
- **Camera/Microphone Controls**: Toggle video and audio during calls
- **Modern UI**: Clean, responsive interface with auto-hiding controls
- **Database Integration**: All room data stored in Supabase

## System Architecture

### Database Schema (Migration: 023_video_rooms.sql)

```sql
-- video_rooms: Manages video call rooms
CREATE TABLE video_rooms (
    id text PRIMARY KEY,
    created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status room_status DEFAULT 'waiting',
    created_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone
);

-- video_room_participants: Tracks participants in rooms
CREATE TABLE video_room_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id text REFERENCES video_rooms(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone
);

-- video_room_signals: Manages WebRTC signaling
CREATE TABLE video_room_signals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id text REFERENCES video_rooms(id) ON DELETE CASCADE,
    from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    signal_type signal_type NOT NULL,
    signal_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
```

### Components Structure

```
components/video/
├── video-room.tsx              # Main video call interface
├── video-call-launcher.tsx     # Modal for creating/joining rooms
└── ...

hooks/
├── use-video-call.ts           # Core WebRTC logic with Supabase integration
└── ...

app/
├── video-call/
│   └── page.tsx                # Standalone video call page
├── (protected-routes)/
│   └── dashboard/
│       ├── page.tsx            # Dashboard with video call integration
│       └── tutor/
│           ├── page.tsx        # Tutor sessions list
│           └── [tutor-id]/
│               └── page.tsx    # Individual tutor session
```

## How to Use

### 1. Creating a Video Room

**From Dashboard:**
- Click the "Create Room" button in the Video Calling section
- Or click "Quick Video Room" in the Quick Actions sidebar
- A unique room ID will be generated automatically
- Share the room ID with others to invite them

**Programmatically:**
```typescript
const handleCreateRoom = () => {
  const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  setCurrentVideoRoom(roomId);
};
```

### 2. Joining a Video Room

**From Dashboard:**
- Click "Join Existing Room" 
- Enter the room ID shared with you
- Click "Join Room"

**From Tutor Sessions:**
- Navigate to any tutor session
- Click "Start Video Call" or "Join Call"

### 3. Video Call Controls

During a video call, you can:
- **Toggle Video**: Turn your camera on/off
- **Toggle Audio**: Mute/unmute your microphone  
- **End Call**: Leave the room
- **Copy Room ID**: Share the room with others
- **View Participants**: See who else is in the call

### 4. Room States

- **Waiting**: Room created, waiting for participants
- **Active**: Multiple participants connected
- **Ended**: Room session completed

## Integration Points

### Dashboard Integration
- Quick access buttons for creating/joining rooms
- Video calling feature card with direct room creation
- Quick actions sidebar with video call options

### Tutor Session Integration  
- Individual tutor sessions include video call functionality
- Room IDs generated based on session context
- Direct integration with tutoring workflow

### Navigation
- Standalone video call page at `/video-call`
- Integrated throughout dashboard and tutor sections
- Modal-based room joining interface

## Technical Implementation

### WebRTC Hook (`use-video-call.ts`)

Key functions:
- `createRoom()`: Creates new room in database
- `joinRoom()`: Joins existing room
- `setupRealtimeListeners()`: Sets up Supabase real-time subscriptions
- `createPeerConnection()`: Handles WebRTC peer connections
- `handleWebRTCSignal()`: Processes ICE candidates and offers/answers

### Real-time Signaling

Uses Supabase real-time channels instead of Socket.IO:
- Room-based channels: `video_room:${roomId}`
- Automatic cleanup when users leave
- Handles WebRTC offer/answer exchange
- ICE candidate sharing

### Security & Privacy

- Row Level Security (RLS) policies on all tables
- Users can only access rooms they're participants in
- Automatic cleanup of ended sessions
- Secure peer-to-peer connections via WebRTC

## Usage Examples

### Basic Room Creation
```typescript
// From any component
const { createRoom } = useVideoCall();
const roomId = await createRoom();
```

### Joining with Auto-Setup
```typescript
const { joinRoom } = useVideoCall({ 
  roomId: "existing-room-id", 
  autoJoin: true 
});
```

### Custom Room ID
```typescript
const customRoomId = `tutor-session-${sessionId}`;
setCurrentVideoRoom(customRoomId);
```

## Testing

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard:**
   - Go to `http://localhost:3001/dashboard`
   - Click "Create Room" to test room creation
   - Copy the room ID and open a new tab/browser to test joining

3. **Test Multi-user:**
   - Open multiple browser windows/tabs
   - Create a room in one window
   - Join the same room from other windows using the room ID

## File Locations

- **Video Components**: `components/video/`
- **WebRTC Hook**: `hooks/use-video-call.ts`
- **Database Migration**: `supabase/migrations/023_video_rooms.sql`
- **Dashboard Integration**: `app/(protected-routes)/dashboard/page.tsx`
- **Tutor Integration**: `app/(protected-routes)/dashboard/tutor/`
- **Standalone Page**: `app/video-call/page.tsx`

## Future Enhancements

- Screen sharing functionality
- Recording capabilities
- Chat during video calls
- Room scheduling and invitations
- Mobile optimization
- Bandwidth optimization settings

The system is now fully integrated and ready for use across the StudyPair platform!
