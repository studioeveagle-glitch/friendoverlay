# 📱 FriendOverlay - Complete Feature List (v2.0)

**Now with Full Chat + Voice/Video Calls (Messenger-Style)**

---

## 🎯 Complete Feature Set

### **1. Authentication** ✅
```
□ Email/Password signup
□ Username (unique)
□ Profile picture (avatar)
□ Online status (online/away/busy/offline)
□ Remember me (persistent session)
□ Logout from all devices
```

---

### **2. Friends System** ✅
```
□ Add friend by username
□ Send friend request
□ Accept/reject requests
□ Pending requests list
□ Friends list (sorted by online status)
□ Block/unblock users
□ Remove friends
□ Friend search
```

---

### **3. Text Chat** ✅
```
□ One-on-one messaging
□ Real-time delivery (<1s)
□ Read receipts (✓✓)
□ Typing indicators ("typing...")
□ Message history (infinite scroll)
□ Timestamp (HH:MM)
□ Delivered status
□ Failed messages (retry)
□ Emoji support
□ Message reactions (emoji)
□ Forward messages
□ Copy message text
□ Delete message (own)
□ Unsend message (within 5 min)
```

---

### **4. Media Sharing** ✅
```
□ Send images (camera/gallery)
□ Send videos (camera/gallery)
□ Send voice notes (hold-to-record)
□ Image preview (tap to expand)
□ Video player (inline)
□ Voice note player (with waveform)
□ Media gallery (per conversation)
□ Download media
□ Auto-download on WiFi
```

---

### **5. Voice Calls** 🆕
```
□ 1-tap voice call
□ Call screen (caller info + buttons)
□ Accept/decline call
□ Mute microphone
□ Speaker toggle
□ End call
□ Call duration timer
□ Call quality indicator
□ Reconnect on network loss
□ Call history (logs)
□ Missed call notifications
□ Call notifications (ringing)
```

---

### **6. Video Calls** 🆕
```
□ 1-tap video call
□ Self-view (picture-in-picture)
□ Full-screen remote video
□ Switch camera (front/back)
□ Mute microphone
□ Disable camera
□ Speaker toggle
□ End call
□ Call duration timer
□ Video quality auto-adjust
□ Network quality indicator
□ Call history (logs)
```

---

### **7. Overlay Drawing** ✅
```
□ Real-time drawing sync
□ Multiple colors (picker)
□ Brush size (small/medium/large)
□ Clear drawing
□ Undo last stroke
□ Eraser tool
□ Per-friend overlay permissions
□ Overlay over ANY app
□ Transparent background
□ Touch passthrough (use app underneath)
□ Dismiss overlay (swipe/double-tap)
□ Auto-dismiss (30s timeout)
□ Multi-stroke support
□ Drawing history (last 10)
```

---

### **8. Notifications** 🆕
```
□ New message notifications
□ New call notifications (ringing)
□ Missed call notifications
□ Friend request notifications
□ Drawing notifications
□ Message preview (toggle)
□ Sound/vibration settings
□ Do Not Disturb mode
□ Badge count (unread messages)
□ Mark as read from notification
□ Reply from notification (quick reply)
```

---

### **9. Settings** ✅
```
□ Profile settings:
  □ Change username
  □ Change avatar
  □ Change status message
  □ Privacy settings

□ Chat settings:
  □ Message preview (on/off)
  □ Media auto-download (WiFi/cellular/never)
  □ Chat wallpaper
  □ Font size (small/medium/large)
  □ Night mode (dark theme)

□ Call settings:
  □ Ringtone selection
  □ Vibration pattern
  □ Auto-answer (after X seconds)
  □ Noise cancellation (on/off)

□ Overlay settings:
  □ Global overlay toggle
  □ Per-friend permissions
  □ Per-app permissions
  □ Default color
  □ Default brush size
  □ Auto-dismiss timeout

□ Privacy settings:
  □ Last seen (everyone/friends/nobody)
  □ Profile photo (everyone/friends/nobody)
  □ Status (everyone/friends/nobody)
  □ Read receipts (on/off)
  □ Typing indicators (on/off)

□ Account settings:
  □ Change password
  □ Two-factor authentication
  □ Linked devices
  □ Delete account
  □ Export data (GDPR)

□ App settings:
  □ Language
  □ Notifications (on/off)
  □ Battery optimization
  □ Clear cache
  □ App version
```

---

### **10. Search** 🆕
```
□ Search conversations
□ Search messages (within chat)
□ Search friends
□ Search media (images/videos/links)
□ Search call logs
□ Recent searches
□ Clear search history
```

---

### **11. Conversation Features** 🆕
```
□ Pin conversations (top)
□ Archive conversations
□ Mute conversations
□ Mark as unread
□ Clear conversation (delete all messages)
□ Delete conversation
□ Block user (from conversation)
□ Report user (from conversation)
□ Conversation info (participants, media, links)
□ Export conversation (PDF/TXT)
```

---

### **12. Call Features** 🆕
```
□ Call logs (all/missed/received/dialed)
□ Call back (from logs)
□ Video call switch (during voice call)
□ Add participant (convert to group call)
□ Call recording (with consent notification)
□ Voicemail (if unanswered)
□ Call waiting
□ Conference calls (3+ people) - FUTURE
```

---

## 📊 Feature Priority

### **MVP (Must Have - Days 1-14)**
```
Priority 1 (Core):
□ Auth (signup/login)
□ Friends system
□ Text chat (real-time)
□ Overlay drawing
□ Android overlay service

Priority 2 (Communication):
□ Voice calls (WebRTC)
□ Video calls (WebRTC)
□ Push notifications

Priority 3 (Polish):
□ Typing indicators
□ Read receipts
□ Online status
□ Message history
```

### **Phase 2 (Should Have - Days 15-21)**
```
□ Media sharing (images/videos)
□ Voice notes
□ Message reactions
□ Call logs
□ Search conversations
□ Profile customization
```

### **Phase 3 (Nice to Have - Days 22-30)**
```
□ Emoji reactions
□ Chat wallpapers
□ Night mode
□ Message forwarding
□ Archive conversations
□ Advanced call features (recording, voicemail)
```

---

## 🛠 Tech Stack Updates

### **New Dependencies**
```javascript
// Voice/Video Calls
npm i react-native-webrtc        // WebRTC for calls
npm i react-native-incall-manager // Call management
npm i react-native-keep-awake     // Keep screen on during calls

// Media
npm i react-native-image-picker   // Camera/gallery
npm i react-native-video          // Video player
npm i react-native-audio-recorder-player // Voice notes

// Notifications
npm i @react-native-firebase/app         // Firebase core
npm i @react-native-firebase/messaging   // Push notifications
npm i react-native-push-notification     // Local notifications

// UI Enhancements
npm i react-native-gesture-handler  // Swipe gestures
npm i react-native-reanimated       // Smooth animations
npm i @react-native-community/blur  // Blur effects
```

### **New Services**
```
□ WebRTC Signaling (via Supabase Realtime)
□ STUN/TURN Servers (for NAT traversal)
  - Use: https://github.com/prism-media/webrtc-stun-turn
  - Or: Twilio TURN ($0.004/GB)
□ Push Notifications (Firebase Cloud Messaging)
□ Media Storage (Supabase Storage or AWS S3)
```

---

## 📱 New Screens

### **Call Screens**
```
□ CallScreen.js          // Active call UI
□ IncomingCallScreen.js  // Full-screen incoming call
□ CallLogsScreen.js      // Call history
□ VideoCallScreen.js     // Video call UI
```

### **Chat Enhancements**
```
□ MediaGalleryScreen.js  // Shared media viewer
□ VoiceNotePlayer.js     // Voice message player
□ EmojiPicker.js         // Emoji/reaction picker
□ MessageInfoScreen.js   // Message details
```

### **Settings**
```
□ CallSettingsScreen.js  // Call-specific settings
□ PrivacySettingsScreen.js // Privacy controls
□ NotificationSettingsScreen.js // Notification prefs
```

---

## 🗄 New Database Tables

Already added in `schema_v2.sql`:
```
□ conversations          // Chat conversations
□ conversation_participants
□ messages (enhanced)    // Text + media + call logs
□ message_reactions      // Emoji reactions
□ call_sessions          // Active WebRTC calls
□ call_logs              // Call history
□ typing_indicators      // "typing..." status
□ user_presence          // Online/offline status
□ push_tokens            // FCM tokens
□ notifications          // Push notification queue
```

---

## 📞 Call Flow (WebRTC)

```
1. Alice taps "Call Bob" (video)
2. App creates call_sessions row (status: 'ringing')
3. Supabase Realtime notifies Bob's device
4. Bob's app shows IncomingCallScreen
5. Bob accepts
6. Alice's app creates WebRTC offer
7. Offer saved to call_sessions
8. Bob's app receives offer via Realtime
9. Bob's app creates WebRTC answer
10. Answer saved to call_sessions
11. ICE candidates exchanged (Realtime)
12. P2P connection established
13. Call starts (status: 'connected')
14. When ended, duration saved to call_logs
```

---

## 🚨 Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **WebRTC NAT Traversal** | Use STUN/TURN servers |
| **Call Notifications (Background)** | Firebase Cloud Messaging + CallKit (iOS) / ConnectionService (Android) |
| **Video Quality** | Adaptive bitrate based on network |
| **Battery Drain (Video Calls)** | Optimize resolution, use hardware encoding |
| **Overlay + Call Simultaneously** | Priority system (call > overlay) |
| **Message Sync Across Devices** | Supabase Realtime + optimistic UI |

---

## 🎯 Updated Timeline

### **Week 1-2: Core (Days 1-14)**
```
□ Database setup (schema v2)
□ Auth + Friends
□ Text chat (real-time)
□ Overlay drawing
□ Android overlay
```

### **Week 3: Voice/Video Calls (Days 15-21)**
```
□ WebRTC setup
□ Voice call UI
□ Video call UI
□ Incoming call screen
□ Call logs
```

### **Week 4: Media + Polish (Days 22-30)**
```
□ Image/video sharing
□ Voice notes
□ Push notifications
□ Settings screens
□ Testing
```

---

## 💰 Updated Cost

| Service | Free Tier | Paid | When |
|---------|-----------|------|------|
| **Supabase** | 500MB, 50k MAU | $25/mo | After 50k users |
| **WebRTC (STUN)** | Free (Google) | $0 | Always |
| **TURN Servers** | 10GB/mo | $0.004/GB | After 10GB |
| **Firebase (FCM)** | Free | $0 | Always free |
| **Supabase Storage** | 1GB | $0.021/GB | After 1GB |
| **Total MVP** | **$0** | ~$50/mo | If successful |

---

**Status:** Schema updated ✅  
**Next:** Start with `supabase/schema_v2.sql` setup  
**ETA:** 30 days to full Messenger-style app
