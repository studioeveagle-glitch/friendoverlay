# ✅ FriendOverlay - Complete Checklist

**Print this and check off as you go!**

---

## 🗄 PHASE 1: DATABASE SETUP (Day 1)

### **Supabase Account**
```
□ Go to supabase.com
□ Create account (GitHub or Email)
□ Verify email
□ Create organization (if prompted)
```

### **Create Project**
```
□ Click "New Project"
□ Name: FriendOverlay
□ Generate secure database password (SAVE IT!)
□ Select closest region
□ Click "Create new project"
□ Wait 2-3 minutes for provisioning
```

### **Upload Schema**
```
□ Go to SQL Editor
□ Click "New Query"
□ Copy schema from docs/DATABASE_SETUP.md
□ Paste entire schema
□ Click "Run"
□ Verify: "Success. No rows returned"
```

### **Enable Realtime**
```
□ Go to Database → Replication
□ Enable Realtime for: drawings
□ Enable Realtime for: messages
□ Enable Realtime for: overlay_sessions
```

### **Get Credentials**
```
□ Go to Settings → API
□ Copy Project URL
□ Copy anon public key
□ Save both in secure location
□ (Optional) Save to .env file
```

### **Verify Tables**
```
□ Go to Table Editor
□ Verify 7 tables exist:
  □ profiles
  □ friends
  □ overlay_permissions
  □ drawings
  □ messages
  □ target_apps
  □ overlay_sessions
□ Check RLS is enabled (shield icon)
```

### **Test Signup**
```
□ Go to Authentication → Users
□ Click "Add User" (test account)
□ Email: test@friendoverlay.app
□ Password: Test123!
□ Click "Create User"
□ Go to Table Editor → profiles
□ Verify test user appears
```

---

## 📱 PHASE 2: REACT NATIVE SETUP (Day 2)

### **Install Node.js** (if not installed)
```
□ Download from nodejs.org
□ Install LTS version
□ Verify: node --version
□ Verify: npm --version
```

### **Create React Native Project**
```
□ npx react-native@latest init FriendOverlayApp
□ cd FriendOverlayApp
□ npm start (verify it runs)
```

### **Install Dependencies**
```
□ npm i @supabase/supabase-js
□ npm i @react-navigation/native
□ npm i @react-navigation/bottom-tabs
□ npm i react-native-screens
□ npm i react-native-safe-area-context
□ npm i @react-native-async-storage/async-storage
□ npm i react-native-elements
□ npm i @react-native-vector-icons/common-icons
□ npx pod-install (iOS only)
```

### **Setup Supabase Client**
```
□ Create app/supabase.js
□ Paste Project URL
□ Paste anon key
□ Test connection
```

### **Create Auth Screen**
```
□ Create app/screens/AuthScreen.js
□ Add signup form (email, password, username)
□ Add login form
□ Test signup in app
□ Verify user appears in Supabase dashboard
```

---

## 👥 PHASE 3: FRIENDS SYSTEM (Days 3-4)

### **Friends Screen UI**
```
□ Create app/screens/FriendsScreen.js
□ Show list of friends
□ Show pending requests
□ Add "Add Friend" button
```

### **Add Friend Functionality**
```
□ Search by username
□ Send friend request
□ Accept/reject requests
□ Verify in Supabase Table Editor
```

### **Overlay Permissions**
```
□ Add toggle per friend (Allow Overlay ✓)
□ Save to overlay_permissions table
□ Verify in database
```

### **Real-time Friend Status**
```
□ Subscribe to friend updates
□ Show online/offline status
□ Test with 2 devices
```

---

## 💬 PHASE 4: CHAT (Day 5)

### **Chat Screen**
```
□ Create app/screens/ChatScreen.js
□ Show message list
□ Text input + send button
```

### **Send/Receive Messages**
```
□ Insert to messages table
□ Real-time subscription
□ Mark as read
```

---

## 🎨 PHASE 5: DRAWING (Days 6-7)

### **Drawing Canvas**
```
□ Install: npm i react-native-skia
□ Create app/screens/DrawScreen.js
□ Canvas with touch input
□ Color picker
□ Clear button
```

### **Save Drawings**
```
□ Convert paths to JSON
□ Insert to drawings table
□ Include: from_id, to_id, paths, color
```

### **Real-time Sync**
```
□ Subscribe to drawings channel
□ Filter: to_id = current user
□ Show incoming drawings
□ Test with 2 devices
```

---

## 🤖 PHASE 6: ANDROID OVERLAY (Days 8-12)

### **Permissions**
```
□ Add to AndroidManifest.xml:
  □ SYSTEM_ALERT_WINDOW
  □ FOREGROUND_SERVICE
  □ POST_NOTIFICATIONS
□ Create permission request flow
□ Redirect to Settings if denied
```

### **Native Overlay Service**
```
□ Create OverlayService.kt
□ Foreground service notification
□ Transparent overlay view
□ WindowManager setup
```

### **React Native Bridge**
```
□ Create OverlayModule.kt
□ Expose to JavaScript
□ startService()
□ stopService()
□ updateDrawing(paths)
```

### **Touch Passthrough**
```
□ Set FLAG_NOT_FOCUSABLE
□ Test: Can use app underneath
□ Test: Can't interact with overlay
```

### **Dismiss Gesture**
```
□ Swipe down to dismiss
□ Double-tap to dismiss
□ Timeout (auto-dismiss after 30s)
```

### **Battery Optimization**
```
□ Pause when screen off
□ Reduce update frequency
□ Add "Active Hours" setting
```

---

## ⚙️ PHASE 7: SETTINGS (Day 13)

### **Settings Screen**
```
□ Create app/screens/SettingsScreen.js
□ Global overlay toggle
□ Battery optimization toggle
□ Active hours setting
□ Per-app permissions
```

### **Target Apps**
```
□ List installed apps
□ Toggle overlay per app
□ Save to target_apps table
```

---

## 🧪 PHASE 8: TESTING (Day 14)

### **Functional Testing**
```
□ Signup/login works
□ Can add friends
□ Friend requests work
□ Overlay permissions work
□ Drawing canvas works
□ Real-time sync <1 second
□ Overlay appears over apps
□ Touch passthrough works
□ Dismiss gesture works
```

### **Device Testing**
```
□ Test on Android 10
□ Test on Android 11
□ Test on Android 12
□ Test on Android 13
□ Test on Android 14
□ Test on Samsung
□ Test on Xiaomi (battery whitelist)
□ Test on Pixel
```

### **Battery Testing**
```
□ Monitor battery drain (1 hour)
□ Monitor battery drain (24 hours)
□ Target: <10% per day
□ Optimize if >15%
```

### **Bug Fixes**
```
□ Fix crash reports
□ Fix overlay not showing
□ Fix realtime disconnects
□ Fix permission issues
```

---

## 🚀 PHASE 9: DEPLOYMENT

### **Android APK**
```
□ cd android && ./gradlew assembleRelease
□ Generate signing key
□ Build signed APK
□ Test on clean device
```

### **Distribution**
```
□ Upload to GitHub Releases
□ Create download page
□ Share with test group (10-100 users)
□ Collect feedback
```

### **Documentation**
```
□ Write README.md
□ Add setup guide
□ Add troubleshooting
□ Add FAQ
```

---

## 📊 METRICS TO TRACK

### **Backend**
```
□ Database size (<500MB free tier)
□ API calls/month (<2B free tier)
□ Realtime connections (<50k free tier)
□ Monthly active users
```

### **App**
```
□ Signup conversion rate
□ Daily active users
□ Session length
□ Overlay usage rate
□ Battery drain complaints
```

---

## 🎯 MVP DEFINITION (Must Have)

```
□ User can signup/login
□ User can add friends
□ User can toggle overlay per friend
□ User can draw
□ Drawing appears on friend's screen (overlay)
□ Overlay is transparent
□ User can use app underneath overlay
□ User can dismiss overlay
```

---

## 🚫 OUT OF SCOPE (For Now)

```
□ iOS overlay (not possible)
□ Group drawings (3+ people)
□ Drawing history
□ Custom colors (use red only for MVP)
□ Voice chat
□ Video chat
□ Play Store launch
□ Monetization
```

---

## 📅 TIMELINE CHECKLIST

### **Week 1 (Days 1-7)**
```
□ Day 1: Database setup ✅
□ Day 2: React Native + Auth ✅
□ Day 3: Friends screen ✅
□ Day 4: Overlay permissions ✅
□ Day 5: Chat ✅
□ Day 6: Drawing canvas ✅
□ Day 7: Realtime sync ✅
```

### **Week 2 (Days 8-14)**
```
□ Day 8: Android permissions ✅
□ Day 9: Overlay service ✅
□ Day 10: RN bridge ✅
□ Day 11: Touch passthrough ✅
□ Day 12: Dismiss gestures ✅
□ Day 13: Settings ✅
□ Day 14: Testing ✅
```

---

## 🎉 LAUNCH CHECKLIST

```
□ All MVP features working
□ Tested on 5+ devices
□ Battery drain <10%/day
□ No critical bugs
□ README written
□ APK built
□ Test group recruited (10+ people)
□ Feedback system setup
```

---

**Current Status:** ⬜ Not Started  
**Next Task:** Complete DATABASE_SETUP.md checklist  
**ETA to MVP:** 14 days
