# 🚀 FriendOverlay - Complete Project Plan

**Draw & Chat Over ANY Android App** | Real-time transparent overlays between friends

---

## 📱 What Is This App?

```
You: Opens Chrome on your phone
Friend: Draws a red circle on their phone
Your Screen: Red circle appears OVER Chrome (transparent overlay)
You: Can still browse Chrome underneath the drawing
```

**Key Features:**
- ✅ Draw on any app (Chrome, games, Perplexity, etc.)
- ✅ Real-time sync (friend sees instantly)
- ✅ Transparent overlay (see app underneath)
- ✅ Per-friend permissions (control who can draw)
- ✅ Text chat between friends
- ✅ $0 backend (Supabase Free Tier)

---

## 🎯 MVP Scope (14 Days)

### **Week 1: Backend + Core UI**
- [ ] Supabase setup (Auth + Database + Realtime)
- [ ] User signup/login
- [ ] Friend system (add/accept/reject)
- [ ] Per-friend overlay permissions
- [ ] Drawing canvas (React Native Skia)
- [ ] Real-time drawing sync

### **Week 2: Android Overlay**
- [ ] Native overlay service (Kotlin)
- [ ] SYSTEM_ALERT_WINDOW permission
- [ ] Foreground service (stay alive)
- [ ] Touch passthrough (use app underneath)
- [ ] Dismiss gesture (swipe to close)
- [ ] Battery optimization

---

## 📁 Project Structure

```
FriendOverlay/
├── docs/                      # Documentation
│   ├── PROJECT_PLAN.md        # This file
│   ├── DATABASE_SETUP.md      # Supabase setup guide
│   ├── ANDROID_OVERLAY.md     # Native overlay guide
│   └── CHECKLIST.md           # Daily checklist
│
├── supabase/                  # Backend (Supabase)
│   ├── schema.sql             # Complete database schema
│   ├── seed.sql               # Test data (optional)
│   ├── rls_policies.sql       # Row-level security
│   └── realtime_setup.sql     # Realtime configuration
│
├── scripts/                   # Setup automation
│   ├── setup_supabase.sh      # Auto-setup backend
│   ├── setup_supabase.bat     # Windows version
│   └── check_status.sh        # Verify setup
│
├── app/                       # React Native App
│   ├── App.js                 # Main entry
│   ├── supabase.js            # Supabase client
│   ├── screens/
│   │   ├── AuthScreen.js      # Login/Signup
│   │   ├── FriendsScreen.js   # Friend list
│   │   ├── ChatScreen.js      # Text chat
│   │   ├── DrawScreen.js      # Drawing canvas
│   │   └── SettingsScreen.js  # App settings
│   ├── components/
│   │   ├── FriendRow.js       # Friend list item
│   │   ├── DrawingCanvas.js   # Skia canvas
│   │   └── OverlayToggle.js   # Permission toggle
│   └── utils/
│       ├── permissions.js     # Android permissions
│       └── realtime.js        # Supabase subscriptions
│
├── android/                   # Native Android
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/.../OverlayService.kt    # Main overlay service
│   │   └── java/.../OverlayModule.kt     # React Native bridge
│   └── build.gradle
│
└── ios/                       # iOS (Limited overlay)
    └── ...                    # Rich notifications only
```

---

## 🗄 Database Setup (DO THIS FIRST)

### **Priority: CRITICAL**
### **Time: 10 minutes**
### **Cost: $0**

```
Step 1: Create Supabase account     → 2 min
Step 2: Create new project          → 2 min
Step 3: Paste schema.sql            → 1 min
Step 4: Enable Realtime             → 1 min
Step 5: Copy credentials            → 1 min
Step 6: Test in app                 → 3 min
```

**See:** `docs/DATABASE_SETUP.md` for detailed guide

---

## 📱 App Development Phases

### **Phase 1: Auth + Friends (Days 1-4)**
```
Day 1: Supabase setup + schema.sql
Day 2: React Native project + Auth screen
Day 3: Friends screen + add friend
Day 4: Per-friend overlay permissions
```

### **Phase 2: Drawing + Realtime (Days 5-7)**
```
Day 5: Drawing canvas (Skia)
Day 6: Real-time sync (Supabase)
Day 7: Drawing history + clear
```

### **Phase 3: Android Overlay (Days 8-12)**
```
Day 8: SYSTEM_ALERT_WINDOW permission
Day 9: Native overlay service (Kotlin)
Day 10: React Native bridge
Day 11: Touch passthrough
Day 12: Dismiss gestures
```

### **Phase 4: Polish (Days 13-14)**
```
Day 13: Settings + battery optimization
Day 14: Testing + bug fixes
```

---

## 🎯 Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| **Backend Setup** | Supabase working | ⬜ |
| **Auth** | Signup/login works | ⬜ |
| **Friends** | Can add friends | ⬜ |
| **Permissions** | Per-friend toggle | ⬜ |
| **Drawing** | Canvas works | ⬜ |
| **Realtime** | Sync <1 second | ⬜ |
| **Overlay** | Shows over apps | ⬜ |
| **Battery** | <10%/day drain | ⬜ |

---

## 🚨 Known Challenges

| Challenge | Difficulty | Solution |
|-----------|------------|----------|
| **Android Overlay** | HARD | Native Kotlin service |
| **Battery Drain** | MEDIUM | Optimize realtime |
| **Play Store** | HIGH | Sideload APK instead |
| **iOS Overlay** | IMPOSSIBLE | Rich notifications only |
| **Touch Passthrough** | MEDIUM | FLAG_NOT_FOCUSABLE |

---

## 📞 Next Steps

1. **START HERE:** `docs/DATABASE_SETUP.md`
2. **Then:** `app/supabase.js` setup
3. **Then:** `app/screens/AuthScreen.js`
4. **Then:** Follow daily checklist

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid | When |
|---------|-----------|------|------|
| **Supabase** | 500MB, 50k MAU | $25/mo | After 50k users |
| **React Native** | Free | $0 | Always |
| **Google Play** | N/A | $25 one-time | If publishing |
| **Domain** | N/A | $15/year | Marketing |
| **Total MVP** | **$0** | ~$40/year | If successful |

---

## 🎮 Demo Flow (First Test)

```
1. User A signs up → username: "alice"
2. User B signs up → username: "bob"
3. Bob adds "alice" → friend request accepted
4. Bob enables overlay for alice ✓
5. Bob opens Draw → draws red heart
6. Alice's screen → ❤️ appears over Chrome!
7. Alice continues browsing (overlay transparent)
8. Alice draws blue circle → Bob sees it
```

---

**Status:** Ready to start  
**First Task:** Database setup (10 min)  
**Next File:** `docs/DATABASE_SETUP.md`
