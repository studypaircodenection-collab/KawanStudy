# WebRTC Video Call Implementation

This implementation brings real-time video and audio calling functionality to StudyPair, based on the WebDevSimplified Zoom clone tutorial but adapted to use Supabase Realtime instead of Socket.io for signaling.

## 🚀 Key Features

- **Real-time Video & Audio Communication**: Peer-to-peer WebRTC connections
- **Supabase Realtime Signaling**: Replaces Socket.io with Supabase real-time channels
- **Multi-user Support**: Grid layout for multiple participants
- **Camera/Microphone Controls**: Toggle video and audio on/off
- **Auto-join Functionality**: Seamless room joining experience
- **Connection Status**: Visual indicators for connection states

## 📁 Files Modified/Created

### Core Implementation
- `hooks/use-video-call.ts` - Main WebRTC hook with Supabase integration
- `components/video/webrtc-video-room.tsx` - WebRTC video room component
- `app/webrtc-test/page.tsx` - Test page for WebRTC functionality

### Updated Files
- `app/(protected-routes)/dashboard/room/[id]/active-room/page.tsx` - Updated to use new WebRTC component

## 🔧 Technical Implementation

### WebRTC Flow

1. **Media Access**: `navigator.mediaDevices.getUserMedia()` for camera/microphone
2. **Peer Connection**: `RTCPeerConnection` with STUN servers for NAT traversal
3. **Signaling**: Supabase Realtime channels for WebRTC signaling messages
4. **Stream Management**: Display local and remote video streams

### Signaling Messages (via Supabase Realtime)

```typescript
// User connection events
channel.send({
  type: 'broadcast',
  event: 'user-connected',
  payload: { userId: string }
});

// WebRTC signaling
channel.send({
  type: 'broadcast',  
  event: 'offer' | 'answer' | 'ice-candidate',
  payload: { offer/answer/candidate, targetUserId, fromUserId }
});
```

### Key Functions

#### `createPeerConnection(userId: string)`
Creates an RTCPeerConnection for a specific user with:
- Local stream tracks added
- Remote stream handling
- ICE candidate exchange
- Connection state monitoring

#### `connectToNewUser(userId: string)`
WebDevSimplified's approach adapted for Supabase:
1. Create peer connection
2. Generate WebRTC offer
3. Send offer via Supabase Realtime
4. Handle answer and establish connection

#### `handleSignalingMessage(event, payload)`
Processes WebRTC signaling messages:
- **offer**: Create answer and send back
- **answer**: Set remote description
- **ice-candidate**: Add ICE candidate

## 🎯 Usage

### Test the Implementation

1. Navigate to `/webrtc-test` in your browser
2. Click "Create Room" to start a new video call
3. Copy the room ID and join from another browser tab/device
4. Test video/audio functionality and WebRTC connection

### Integration in StudyPair

```typescript
import { WebRTCVideoRoom } from '@/components/video/webrtc-video-room';

function RoomPage() {
  return (
    <WebRTCVideoRoom 
      roomId="your-room-id" 
      onLeave={() => router.push('/dashboard')}
    />
  );
}
```

## 🔗 WebRTC Configuration

```typescript
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

## 📊 Database Schema

The implementation uses existing StudyPair tables:
- `video_rooms` - Room management
- `video_room_participants` - Participant tracking  
- `profiles` - User information

No additional database changes required - signaling happens via Supabase Realtime channels.

## 🔍 Debugging

Enable console logs to see WebRTC connection flow:
- Peer connection creation
- Signaling message exchange
- Connection state changes
- Media stream handling

## 🚧 Known Limitations

1. **TURN Servers**: Currently only uses STUN servers - may need TURN for some network configurations
2. **Screen Sharing**: Not implemented (placeholder in UI)
3. **Recording**: Not implemented
4. **Mobile Optimization**: May need additional mobile-specific handling

## 🎉 Success Indicators

When working correctly, you should see:
- ✅ Media access granted (camera/microphone)
- ✅ Real-time signaling via Supabase
- ✅ WebRTC peer connections established
- ✅ Video/audio streams flowing between participants
- ✅ Connection status indicators

## 📝 Next Steps

1. **TURN Server Integration**: Add TURN servers for better connectivity
2. **Screen Sharing**: Implement getDisplayMedia() support
3. **Recording**: Add meeting recording functionality
4. **Mobile App**: Extend to React Native implementation
5. **Load Testing**: Test with multiple participants

## 🔧 Troubleshooting

### Camera/Microphone Access
- Ensure browser permissions are granted
- Check if other applications are using camera/microphone
- Test in incognito/private browsing mode

### Connection Issues
- Check browser console for WebRTC errors
- Verify Supabase Realtime connection
- Test with different networks/devices

### Audio/Video Not Working
- Check media track enabled status
- Verify peer connection state
- Test local stream display first

---

This WebRTC implementation successfully brings real-time video calling to StudyPair, providing a solid foundation for peer-to-peer communication and study collaboration.
