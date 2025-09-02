# Persistent Messaging System

## Overview

The persistent messaging system provides a complete chat solution where messages are stored in the database, allowing users to receive and view messages even when they were offline. This system combines real-time messaging with persistent storage for a complete messaging experience.

## 🔄 **Key Improvements Over Realtime-Only Chat**

- ✅ Messages stored permanently in database
- ✅ Complete message history
- ✅ Works when users are offline
- ✅ Real-time delivery when both online
- ✅ Conversation management
- ✅ Read receipts and unread counts
- ✅ Message editing support

## 🗄️ **Database Schema**

### Tables Created

#### `conversations`

```sql
- id (uuid, primary key)
- participant_1 (uuid, references profiles.id)
- participant_2 (uuid, references profiles.id)
- created_at (timestamp)
- updated_at (timestamp)
- unique constraint on participant pairs
```

#### `messages`

```sql
- id (uuid, primary key)
- conversation_id (uuid, references conversations.id)
- sender_id (uuid, references profiles.id)
- content (text, max 4000 chars)
- message_type ('text', 'image', 'file')
- metadata (jsonb)
- is_edited (boolean)
- edited_at (timestamp)
- created_at (timestamp)
```

#### `message_read_status`

```sql
- id (uuid, primary key)
- message_id (uuid, references messages.id)
- user_id (uuid, references profiles.id)
- read_at (timestamp)
- unique constraint per user/message
```

## 🔐 **Security Features**

### Row Level Security (RLS)

- **Conversations**: Users can only access their own conversations
- **Messages**: Users can only see messages in their conversations
- **Read Status**: Users can only mark their own messages as read

### Data Validation

- **Content length**: Maximum 4000 characters per message
- **Empty messages**: Prevented at database level
- **Self-messaging**: Blocked in application logic
- **Participant validation**: Ensures users exist before creating conversations

## 🚀 **API Functions**

### Core Functions

#### `get_or_create_conversation(user1_id, user2_id)`

- Creates consistent conversation between two users
- Returns existing conversation if found
- Ensures proper participant ordering

#### `send_message(recipient_username, content, message_type)`

- Sends message to specific user
- Creates conversation if needed
- Returns complete message object with sender info

#### `get_conversation_by_username(username)`

- Gets conversation with specific user
- Includes recent messages (last 50)
- Creates conversation if doesn't exist

#### `get_user_conversations()`

- Lists all user's conversations
- Includes last message and unread count
- Sorted by most recent activity

#### `mark_message_read(message_id)`

- Marks individual message as read
- Used for read receipts

## 💻 **Frontend Components**

### `PersistentChat` Component

**Location**: `components/chat/persistent-chat.tsx`

**Features**:

- Database-backed message storage
- Real-time updates via Supabase subscriptions
- Message editing indicators
- Connection status display
- Error handling and retry logic
- Automatic read receipt marking

### `usePersistentChat` Hook

**Location**: `hooks/use-persistent-chat.tsx`

**Features**:

- Message loading and sending
- Real-time subscription management
- Connection status tracking
- Error handling
- Automatic read marking

### Message Button Integration

- Updated to use persistent chat
- Maintains existing UI/UX
- Backward compatible

### Conversations List Page

**Location**: `app/(protected-routes)/dashboard/messages/page.tsx`

**Features**:

- List of all user conversations
- Unread message counts
- Last message preview
- Direct navigation to chat

## 🔄 **Real-time + Persistence Flow**

### **Hybrid Real-time System**

The system uses a **dual approach** for maximum reliability:

1. **Supabase Broadcast Events** (Primary real-time method)

   - Instant message delivery when both users online
   - Uses the same room naming convention: `username1_username2`
   - Messages broadcast immediately after database storage

2. **Postgres Changes Subscription** (Backup real-time method)
   - Fallback for when broadcast fails
   - Listens to database INSERT events
   - Automatically syncs if broadcast messages are missed

### Message Sending Flow

1. **User sends message** → Stored in database via `send_message()` function
2. **Database storage** → Message persisted with all metadata
3. **Broadcast event** → Real-time delivery to other user's channel
4. **Local state update** → Sender sees message immediately
5. **Recipient receives** → Message appears instantly if online

### Message Receiving Flow

1. **Page load** → Fetches all conversation messages from database
2. **Real-time subscription** → Listens for new broadcast events
3. **New message arrives** → Added to local state immediately
4. **Duplicate prevention** → Checks message ID to avoid duplicates
5. **Postgres backup** → Syncs any missed messages from database

### **Why This Approach Works**

- **Instant delivery** when both users are online (broadcast)
- **Guaranteed persistence** in database for offline users
- **No message loss** due to dual delivery system
- **Consistent experience** whether online or offline

## 📱 **User Experience**

### Seamless Experience

- **Instant delivery** when both users online
- **Persistent storage** when users offline
- **Message history** always available
- **Unread indicators** show new messages
- **Connection status** visible to users

### Error Handling

- **Connection lost** → Shows reconnecting status
- **Send failure** → Retry button available
- **Loading states** → Skeleton animations
- **Empty states** → Helpful messaging

## 🛠️ **Migration Guide**

### Database Setup

```bash
# Run the new migration
psql -f supabase/migrations/005_messaging_system.sql

# Or use the master schema (includes all migrations)
psql -f supabase/master_schema.sql
```

### Component Updates

- **MessageButton**: Now uses `PersistentChat`
- **Chat pages**: Updated to persistent system
- **New conversations page**: Browse all chats

## 🧪 **Testing the System**

### Basic Functionality

1. **Send message** when both users online → Should appear instantly
2. **Send message** when recipient offline → Should appear when they return
3. **Close/reopen chat** → Message history should persist
4. **Multiple conversations** → Each should be separate and persistent

### Advanced Features

1. **Unread counts** → Should update accurately
2. **Read receipts** → Should mark messages as read when viewing
3. **Connection status** → Should show when disconnected
4. **Error handling** → Should gracefully handle failures

## 📊 **Performance Considerations**

### Database Optimization

- **Indexes** on conversation participants and message timestamps
- **Message pagination** (currently 50 messages, can be expanded)
- **Efficient queries** using RPC functions

### Real-time Efficiency

- **Targeted subscriptions** per conversation
- **Automatic cleanup** when components unmount
- **Connection pooling** handled by Supabase

## 🔮 **Future Enhancements**

### Message Features

- **File attachments** (images, documents)
- **Message reactions** (emoji responses)
- **Message threading** (replies to specific messages)
- **Message search** across all conversations

### Conversation Features

- **Group chats** (multiple participants)
- **Conversation archiving**
- **Message deletion**
- **Conversation muting**

### Notification System

- **Push notifications** for new messages
- **Email notifications** for offline users
- **Notification preferences**

### Advanced Features

- **Typing indicators**
- **Online status** indicators
- **Message encryption** for privacy
- **Voice messages**

The persistent messaging system provides a complete, production-ready chat solution that works reliably whether users are online or offline, making KawanStudy a truly connected learning platform.
