# Direct Messaging System - Implementation Guide

## 📋 Overview
A complete peer-to-peer messaging system between customers and vendors with real-time features, read receipts, and soft deletes.

---

## 🗄️ Database Models

### 1. **Conversation Model** (`models/Conversation.js`)
Stores metadata about conversations between users.

**Fields:**
- `participants`: Array of user IDs (customer + vendor)
- `vendorId`: Reference to the vendor (for filtering and permissions)
- `businessId`: Optional reference to the business being discussed
- `lastMessage`: Preview of the last message
- `lastMessageTime`: Timestamp of last message
- `lastMessageSender`: Who sent the last message
- `isActive`: Boolean to mark active/archived conversations
- `blockedBy`: User ID if conversation is blocked
- `timestamps`: createdAt & updatedAt

**Indexes:**
- `participants`: Fast lookup of user's conversations
- `vendorId`: Fast vendor-specific queries
- `lastMessageTime`: Sorting conversations by recency

---

### 2. **Message Model** (`models/Message.js`)
Stores individual messages.

**Fields:**
- `conversation`: Reference to parent conversation
- `sender`: User who sent the message
- `receiver`: User who receives the message
- `content`: Message text (max 5000 chars)
- `isRead`: Boolean tracking if message is read
- `readAt`: Timestamp when message was read
- `isDeleted`: Soft delete flag (messages never permanently deleted)
- `deletedAt`: When message was soft-deleted
- `attachments`: Array for future file support
- `timestamps`: createdAt & updatedAt

**Indexes:**
- `conversation + createdAt`: Fast message retrieval
- `conversation + isRead`: Quick unread count
- `sender` & `receiver`: User-specific queries

**Hooks:**
- Auto-updates parent conversation's `lastMessage` fields on save

---

## 🔐 Security & Authorization

### Middleware: `isConversationParticipant`
Ensures users can only access conversations they're part of.

```javascript
// Validates:
// 1. Conversation exists
// 2. User is a participant in conversation
// Redirects to /messages if unauthorized
```

### Route Protection
- **GET /messages** - Must be logged in
- **GET /messages/:conversationId** - Must be participant
- **POST /messages/:conversationId/send** - Must be participant
- **DELETE /messages/:conversationId/delete/:messageId** - Sender only
- **PATCH /messages/:conversationId/block** - Participant only

---

## 🛣️ Routes & Endpoints

### 1. **GET /messages**
**Description:** Display user's message dashboard with all conversations
**Auth:** `isLoggedIn`
**Returns:** Rendered HTML with:
- List of all user's conversations
- Unread count per conversation
- Last message preview
- Sorted by recency

**Features:**
- Populates participant user data
- Counts unread messages per conversation
- Calculates total unread count

---

### 2. **GET /messages/start/:vendorId**
**Description:** Start or retrieve existing conversation with vendor
**Auth:** `isLoggedIn`
**Query Params:** `businessId` (optional)
**Returns:** Redirect to `/messages/:conversationId`

**Logic:**
1. Validates vendor exists and has "Vendor" role
2. Prevents self-messaging
3. Checks if conversation already exists
4. Creates new conversation if needed
5. Redirects to conversation view

---

### 3. **POST /messages/start/:vendorId** (Backward Compatible)
**Description:** Same as GET but accepts businessId in request body
**Auth:** `isLoggedIn`
**Body:** `{ businessId: string }`

---

### 4. **GET /messages/:conversationId**
**Description:** View conversation and all messages
**Auth:** `isLoggedIn` + `isConversationParticipant`
**Returns:** Rendered HTML with:
- Conversation details
- All messages (last 50)
- Other participant info
- Message composition form

**Automatic Actions:**
- Marks all messages as read for current user
- Records read timestamp

---

### 5. **POST /messages/:conversationId/send**
**Description:** Send a new message
**Auth:** `isLoggedIn` + `isConversationParticipant`
**Content-Type:** `application/json`
**Body:** 
```json
{ "content": "Your message text" }
```

**Returns:** 
```json
{
  "success": true,
  "message": {
    "_id": "...",
    "content": "...",
    "sender": { "username": "..." },
    "createdAt": "...",
    "isRead": false
  }
}
```

**Validation:**
- Content cannot be empty
- Max 5000 characters
- Conversation must not be blocked

**Automatic Actions:**
- Post hook updates parent conversation's lastMessage fields
- Can be used via AJAX for real-time display

---

### 6. **DELETE /messages/:conversationId/delete/:messageId**
**Description:** Soft-delete a message
**Auth:** `isLoggedIn` + `isConversationParticipant` + `sender only`
**Returns:** 
```json
{ "success": true }
```

**Details:**
- Only message sender can delete
- Marks as deleted but keeps in database
- Records deletion timestamp

---

### 7. **PATCH /messages/:conversationId/block**
**Description:** Block/unblock a conversation
**Auth:** `isLoggedIn` + `isConversationParticipant`
**Returns:**
```json
{
  "success": true,
  "blocked": true/false
}
```

**Logic:**
- Toggle block state for current user
- Prevents further messaging if blocked
- Both parties can independently block

---

### 8. **GET /api/messages/unread-count**
**Description:** Get total unread message count (for badge)
**Auth:** `isLoggedIn`
**Returns:**
```json
{ "unreadCount": 5 }
```

**Usage:** Called by navbar script every 10 seconds to update badge

---

## 📱 Frontend Components

### 1. **messages.ejs**
Dashboard view showing all conversations.

**Features:**
- Conversation list with avatars
- Unread count badges
- Last message preview
- Time since last message
- Responsive sidebar layout
- "Select a conversation" empty state

---

### 2. **conversation.ejs**
Individual conversation view with chat interface.

**Features:**
- Message bubbles (different styling for sender/receiver)
- Timestamp on each message
- "Seen" indicators (✓✓)
- Delete button on own messages
- Message input form
- Auto-scroll to bottom
- Block conversation button
- Responsive design

**JavaScript Features:**
- AJAX message sending (no page reload)
- Real-time message deletion
- Auto-refresh every 3 seconds (polls for new messages)
- Attaches event listeners dynamically
- Handles form validation

---

### 3. **Navbar Integration** (boilerplate.ejs)
- Messages link with envelope icon
- Unread count badge (red)
- Updates every 10 seconds
- Only visible when logged in

---

## 🎯 Usage Examples

### Starting a Conversation

**From Business Show Page:**
```html
<a href="/messages/start/<%= business.Owner._id %>?businessId=<%= business._id %>" class="btn btn-success">
  💬 Message Vendor
</a>
```

**From Dashboard:**
```html
<a href="/messages/start/<%= vendorId %>" class="btn btn-primary">
  Message
</a>
```

### Sending a Message (AJAX)
```javascript
const conversationId = '65abc123...';
const content = 'Hello, are you still available?';

const response = await fetch(`/messages/${conversationId}/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content })
});

const data = await response.json();
if (response.ok) {
  console.log('Message sent:', data.message);
}
```

### Deleting a Message
```javascript
const messageId = '65abc456...';

const response = await fetch(`/messages/${conversationId}/delete/${messageId}`, {
  method: 'DELETE'
});

if (response.ok) {
  // Remove from DOM
  messageElement.remove();
}
```

---

## 🔄 Auto-Refresh & Real-Time Features

**Current Implementation:** Polling every 3 seconds
- Fetches entire conversation page
- Compares HTML with current DOM
- Updates if new messages detected

**Why Polling Instead of WebSockets?**
- Easier to implement initially
- Works with EJS server-side rendering
- Good enough for most use cases
- Lower server resources

**Future Enhancement: WebSockets**
```javascript
// With Socket.io
socket.on('new-message', (message) => {
  // Add message to DOM in real-time
  messagesContainer.appendChild(createMessageElement(message));
});
```

---

## 📊 Performance Optimizations

### Database Indexes
1. `{ participants: 1 }` - Fast conversation lookup
2. `{ conversation: 1, createdAt: -1 }` - Fast message retrieval
3. `{ conversation: 1, isRead: 1 }` - Fast unread count
4. `{ lastMessageTime: -1 }` - Fast conversation sorting

### Query Optimizations
- Lean queries where mutation not needed (`.lean()`)
- Pagination for message history (max 50 at a time)
- Selective field population (only needed fields)
- Count-only queries for badges

### Frontend Optimizations
- AJAX for message sending (no page reload)
- Event delegation for dynamic elements
- Debounced auto-refresh (3 second interval)
- Dynamic script attachment only when needed

---

## 🚨 Error Handling

### Client-Side
- Form validation (non-empty, max length)
- Network error alerts
- Toast notifications for failures
- Graceful degradation

### Server-Side
- Comprehensive try-catch blocks
- Proper HTTP status codes
- JSON error responses
- Console logging for debugging
- Flash messages for page redirects

---

## 📝 Data Flow

### Sending a Message
```
User types message
    ↓
Clicks Send button
    ↓
AJAX POST to /messages/:conversationId/send
    ↓
Server validates content
    ↓
Creates Message document
    ↓
Post-hook updates Conversation lastMessage fields
    ↓
Returns message JSON
    ↓
JavaScript adds to DOM immediately
    ↓
Auto-refresh updates other party's view in 3 seconds
```

### Reading Messages
```
User opens conversation
    ↓
GET /messages/:conversationId renders
    ↓
Server fetches all non-deleted messages
    ↓
Server marks as read for current user
    ↓
HTML rendered with messages
    ↓
JavaScript attaches event listeners
    ↓
Auto-refresh polls every 3 seconds
```

---

## 🔮 Future Enhancements

### Phase 1 (High Priority)
- [ ] Typing indicators
- [ ] Message search
- [ ] Conversation archiving
- [ ] Message reactions/emojis
- [ ] File/image attachments

### Phase 2 (Medium Priority)
- [ ] WebSocket real-time messaging
- [ ] Video/voice calls
- [ ] Message groups (3+ people)
- [ ] Read receipts with timestamps
- [ ] Message pinning

### Phase 3 (Low Priority)
- [ ] Message encryption
- [ ] Message scheduling
- [ ] Automated responses/templates
- [ ] Message translation
- [ ] Analytics & reporting

---

## 🛠️ Troubleshooting

### Messages not showing
- Check if `isDeleted: false`
- Verify conversation ID is correct
- Check user is participant

### Badge not updating
- Verify `/api/messages/unread-count` returns data
- Check browser console for errors
- Ensure user is logged in

### Can't start conversation
- Verify vendor has `role: "Vendor"`
- Check vendor exists
- Ensure not messaging yourself

### Soft-deleted messages appearing
- Verify query includes `isDeleted: false`
- Check Message model hooks

---

## 📚 Code Files

**Database Models:**
- `models/Message.js`
- `models/Conversation.js`

**Backend Routes:**
- `app.js` (lines 1590-1900+)

**Frontend Views:**
- `views/messages.ejs`
- `views/conversation.ejs`
- `views/layouts/boilerplate.ejs` (navbar integration)

**Business Page Integration:**
- `views/show.ejs` (Message Vendor button)

---

**Version:** 1.0.0
**Last Updated:** December 19, 2025
**Author:** Findify Development Team
