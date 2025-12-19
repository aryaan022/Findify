# Direct Messaging System - Deployment & Testing Checklist

## ✅ Pre-Deployment Testing

### Unit Testing - Database Models

- [ ] Message model creates documents correctly
  ```javascript
  const msg = new Message({
    conversation: id,
    sender: id,
    receiver: id,
    content: 'Test message'
  });
  await msg.save();
  ```

- [ ] Conversation model creates with correct fields
  ```javascript
  const conv = new Conversation({
    participants: [userId1, userId2],
    vendorId: userId2,
    businessId: businessId
  });
  await conv.save();
  ```

- [ ] Message post-hook updates conversation
  - Save a message
  - Verify conversation.lastMessage updated

- [ ] Indexes created correctly
  ```javascript
  // Check in MongoDB
  db.conversations.getIndexes()
  db.messages.getIndexes()
  ```

---

### Route Testing - Message Endpoints

#### 1. GET /messages (View all conversations)
- [ ] Unauthenticated user → Redirect to login
- [ ] Authenticated user → Shows all conversations
- [ ] Displays conversation list correctly
- [ ] Unread count calculated per conversation
- [ ] Total unread count shown
- [ ] Sorted by lastMessageTime (newest first)
- [ ] Empty state shows for user with no conversations

#### 2. GET /messages/start/:vendorId?businessId=:id
- [ ] Non-existent vendor → "Invalid vendor" flash
- [ ] Non-vendor user → "Invalid vendor" flash
- [ ] Self-messaging → "Cannot message yourself" flash
- [ ] New conversation → Creates conversation
- [ ] Existing conversation → Reuses conversation
- [ ] With businessId → Sets businessId in conversation
- [ ] Without businessId → businessId is null
- [ ] Redirects to correct conversation ID

#### 3. GET /messages/:conversationId
- [ ] Non-existent conversation → Error
- [ ] Non-participant user → Redirect to /messages
- [ ] Participant user → Shows conversation
- [ ] Loads last 50 messages
- [ ] Messages sorted oldest first in view
- [ ] Marks all receiver messages as read
- [ ] Shows other participant info
- [ ] Other participant has correct role badge

#### 4. POST /messages/:conversationId/send
- [ ] Non-participant → Error
- [ ] Empty content → Error: "Message cannot be empty"
- [ ] Content > 5000 chars → Error: "Message is too long"
- [ ] Blocked conversation → Error: "Conversation blocked"
- [ ] Valid message → Creates message
- [ ] Valid message → Returns JSON with message object
- [ ] Valid message → Updates conversation metadata
- [ ] Sender field correct
- [ ] Receiver field correct

#### 5. DELETE /messages/:conversationId/delete/:messageId
- [ ] Non-sender deletes → Error: "Only delete own messages"
- [ ] Sender deletes → Message marked as deleted
- [ ] Soft delete → Message still in DB
- [ ] isDeleted flag set to true
- [ ] deletedAt timestamp recorded
- [ ] Returns { success: true }

#### 6. PATCH /messages/:conversationId/block
- [ ] Non-participant → Error
- [ ] Blocks conversation → blockedBy set to userId
- [ ] Unblocks conversation → blockedBy set to null
- [ ] Can't send when blocked → Error in POST /send
- [ ] Returns correct blocked status

#### 7. GET /api/messages/unread-count
- [ ] Unauthenticated → Redirect or 401
- [ ] Returns JSON with unreadCount
- [ ] Count is accurate
- [ ] Only counts isRead: false
- [ ] Only counts isDeleted: false
- [ ] Updates when message received
- [ ] Returns 0 when no unread

---

### Frontend Testing - UI Components

#### Messages Dashboard (messages.ejs)
- [ ] Page loads without errors
- [ ] Conversation list displays
- [ ] User avatars/names show correctly
- [ ] Unread badges appear for > 0
- [ ] Badge numbers are correct
- [ ] Last message preview truncated appropriately
- [ ] Timestamps formatted correctly
- [ ] Clicking conversation navigates correctly
- [ ] Responsive on mobile (sidebar collapses)
- [ ] Empty state shows when no conversations

#### Conversation View (conversation.ejs)
- [ ] Page loads without errors
- [ ] Header shows other participant name
- [ ] Header shows business name (if applicable)
- [ ] Block button accessible
- [ ] Messages display correctly
- [ ] Own messages right-aligned (blue)
- [ ] Other messages left-aligned (gray)
- [ ] Timestamps show on messages
- [ ] "✓✓ seen" appears for read messages
- [ ] Input field for composing
- [ ] Send button functional
- [ ] Message list auto-scrolls to bottom
- [ ] Old messages load on scroll up
- [ ] Delete button appears on own messages
- [ ] Delete button works (removes message)
- [ ] Responsive design works on mobile

#### Navbar Integration (boilerplate.ejs)
- [ ] "Messages" link appears when logged in
- [ ] "Messages" link doesn't appear when logged out
- [ ] Envelope icon displays
- [ ] Badge appears when unread > 0
- [ ] Badge shows correct count
- [ ] Badge doesn't appear when unread = 0
- [ ] Badge updates automatically (10 sec interval)
- [ ] Link navigates to /messages correctly
- [ ] Badge styling visible (red background)

#### Show Page Integration (show.ejs)
- [ ] "Message Vendor" button appears for users only
- [ ] "Message Vendor" button doesn't appear for vendors
- [ ] "Message Vendor" button doesn't appear when logged out
- [ ] Button navigates to correct vendor
- [ ] businessId parameter passed correctly
- [ ] Button styling matches other action buttons

---

### Edge Cases & Error Handling

- [ ] Very long message (near 5000 chars) → Sends correctly
- [ ] Special characters in message → Display correctly
- [ ] Emoji in message → Display correctly
- [ ] HTML tags in message → Escaped (no XSS)
- [ ] Message with newlines → Preserved in display
- [ ] Rapid message sends → No duplicates
- [ ] Deleted message in thread → Shows "[Deleted]" or removed
- [ ] Network timeout during send → Graceful error
- [ ] Page refresh during typing → Message not lost
- [ ] Multiple browser tabs → Messages sync
- [ ] Vendor deletes business → Conversation still accessible

---

### Security Testing

- [ ] User A cannot see User B's conversations
- [ ] User A cannot delete User B's messages
- [ ] User A cannot read User B's messages
- [ ] User cannot send to non-vendor
- [ ] User cannot message themselves
- [ ] Blocked conversation prevents sends
- [ ] SQL injection attempts → No database issues
- [ ] XSS attempts in message → Content escaped
- [ ] CSRF token → Passed with requests
- [ ] Session hijacking → Not possible with secure cookies

---

### Performance Testing

- [ ] Dashboard loads < 200ms (10 conversations)
- [ ] Conversation loads < 150ms (50 messages)
- [ ] Message send < 100ms (server processing)
- [ ] Unread count API < 50ms
- [ ] No memory leaks from polling
- [ ] Auto-refresh doesn't spike CPU
- [ ] Large messages (5000 chars) handle fine
- [ ] 100+ messages in conversation → Still loads fast

---

### Browser Compatibility

- [ ] Chrome (latest) - ✓
- [ ] Firefox (latest) - ✓
- [ ] Safari (latest) - ✓
- [ ] Edge (latest) - ✓
- [ ] Mobile Chrome - ✓
- [ ] Mobile Safari - ✓
- [ ] No console errors in any browser

---

### Mobile/Responsive Testing

- [ ] iPhone 12 - Works correctly
- [ ] iPhone SE - Works correctly
- [ ] Android phone - Works correctly
- [ ] iPad - Works correctly
- [ ] Landscape mode - Layout adjusts
- [ ] Portrait mode - Layout adjusts
- [ ] Touch interactions work (no hover-dependent features)
- [ ] Keyboard displays correctly (iOS/Android)
- [ ] Form submission on mobile - Works

---

## 📋 Deployment Steps

### Step 1: Pre-Deployment Backup
```bash
# Backup current database
mongodump --uri "mongodb://your-connection-string" --out ./backup-$(date +%Y%m%d)

# Or for Atlas: Use Atlas backup feature
```

### Step 2: Pull Latest Code
```bash
git add .
git commit -m "Add Direct Messaging System"
git push origin main
# Or manually copy files to deployment server
```

### Step 3: Install Dependencies (if needed)
```bash
cd /path/to/findify
npm install
# All required packages should already be in package.json
```

### Step 4: Database Migration (if needed)
```javascript
// Run in Node.js or via MongoDB client
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ vendorId: 1 });
db.conversations.createIndex({ lastMessageTime: -1 });
db.messages.createIndex({ conversation: 1, createdAt: -1 });
db.messages.createIndex({ conversation: 1, isRead: 1 });
db.messages.createIndex({ sender: 1 });
db.messages.createIndex({ receiver: 1 });
```

### Step 5: Start Application
```bash
# Development
npm start
# or
node app.js

# Production
npm run start:prod
# or with PM2
pm2 start app.js --name "findify"
```

### Step 6: Verify Deployment
- [ ] Navigate to /messages → No 404 error
- [ ] Can start conversation → No errors
- [ ] Can send message → No errors
- [ ] Badge updates → Works correctly
- [ ] No console errors → Application clean
- [ ] Database connection OK → Data persists

---

## 🔍 Post-Deployment Verification

### 24-Hour Monitoring
- [ ] No error spikes in logs
- [ ] Database performance normal
- [ ] No crash reports
- [ ] Users reporting positive feedback
- [ ] Unread badge working for all users
- [ ] Messages delivery reliable
- [ ] No data corruption

### Weekly Monitoring
- [ ] Monthly active users using messaging
- [ ] Average conversation length
- [ ] Peak usage times
- [ ] Any bug reports from users
- [ ] Database query performance
- [ ] Server resource usage

---

## 🐛 Rollback Plan

If issues occur post-deployment:

```bash
# Step 1: Stop current application
pm2 stop findify  # or kill process

# Step 2: Revert code
git revert HEAD  # Last commit with messaging
git push origin main

# Step 3: Restart
pm2 restart findify

# Step 4: Restore database (if needed)
mongorestore --uri "mongodb://..." backup-folder/

# Step 5: Verify
# Run tests again
```

---

## 📞 Support Contacts

If issues arise:

1. **Database Issues**
   - Check MongoDB logs
   - Verify indexes exist
   - Check connection string

2. **Routes Not Working**
   - Check app.js imports
   - Verify models required
   - Check middleware functions

3. **Views Not Rendering**
   - Clear browser cache
   - Check views folder path
   - Verify EJS syntax

4. **Badge Not Updating**
   - Check /api/messages/unread-count endpoint
   - Verify JavaScript console for errors
   - Check auto-refresh interval

---

## ✅ Final Deployment Sign-Off

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Database backed up
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring in place
- [ ] Ready for production

---

## 📊 Success Metrics

After deployment, track:
```
✓ Daily users accessing messaging feature
✓ Average conversation length
✓ Message delivery success rate (99%+ target)
✓ Page load time < 200ms
✓ Zero unplanned downtime
✓ User satisfaction rating
✓ Bug reports < 2 per week
```

---

**Deployment Status:** Ready ✅
**Risk Level:** Low (backward compatible)
**Rollback Difficulty:** Easy
**Estimated Downtime:** None (hot deploy)

Good luck! 🚀
