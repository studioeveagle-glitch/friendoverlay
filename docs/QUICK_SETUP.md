# ⚡ Quick Setup Guide (5 Minutes)

**Simple Username + Password Auth + Real-Time Chat**

---

## 🗄 Step 1: Create Supabase Project (2 min)

```
1. Go to https://supabase.com
2. Sign in (GitHub or Email)
3. Click "New Project"
4. Fill in:
   - Name: FriendOverlay
   - Password: [SAVE THIS SECURELY]
   - Region: [Closest to you]
5. Click "Create new project"
6. Wait 2 minutes
```

---

## 📜 Step 2: Upload Schema (1 min)

```
1. Go to SQL Editor (left sidebar)
2. Click "New Query"
3. Copy entire file: supabase/schema_v3_simple_auth.sql
4. Paste into SQL Editor
5. Click "Run" (or Ctrl+Enter)
6. Verify: "Success. No rows returned"
```

---

## ⚙️ Step 3: Enable Realtime (1 min)

```
1. Go to Database → Replication
2. Find these tables:
   □ messages
   □ conversations
   □ user_presence
   □ call_sessions
   □ drawings
3. Toggle "Enable Realtime" for EACH table ✓
```

---

## 🔑 Step 4: Get Credentials (30 sec)

```
1. Go to Settings (gear icon)
2. Click "API"
3. Copy these 2 values:
   - Project URL: https://xxxxx.supabase.co
   - anon public: eyJhbG... (long string)
4. SAVE BOTH
```

---

## 📱 Step 5: Configure App (1 min)

Open `app/supabase.js` and replace:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
// Paste your URL here (keep quotes)

const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
// Paste your anon key here (keep quotes)
```

---

## ✅ Step 6: Verify Setup (1 min)

```
1. Go to Table Editor (left sidebar)
2. You should see 10 tables:
   □ profiles
   □ friends
   □ overlay_permissions
   □ drawings
   □ conversations
   □ conversation_participants
   □ messages
   □ call_sessions
   □ call_logs
   □ user_presence

3. Go to SQL Editor
4. Run this test query:

SELECT COUNT(*) FROM profiles;

5. Should return: 0 (no users yet)
```

---

## 🧪 Step 7: Test Signup (1 min)

```
1. Go to SQL Editor
2. Run this test:

SELECT signup('testuser', 'password123');

3. Should return:
   {"success": true, "user_id": "uuid-here"}

4. Go to Table Editor → profiles
5. Verify: testuser appears

6. Test login:

SELECT login('testuser', 'password123');

7. Should return:
   {"success": true, "user_id": "uuid-here", "username": "testuser"}
```

---

## 🚀 Step 8: Run React Native App

```bash
# Install dependencies
cd FriendOverlay
npm install

# Run on Android
npx react-native run-android

# Run on iOS (Mac only)
npx react-native run-ios
```

---

## 📋 Complete File Checklist

```
Database:
□ supabase/schema_v3_simple_auth.sql (uploaded)
□ Realtime enabled for 5 tables

App Config:
□ app/supabase.js (credentials added)
□ app/screens/AuthScreen.js (ready)
□ app/screens/ChatScreen.js (ready)
□ app/utils/realtime.js (ready)

Dependencies:
□ @supabase/supabase-js
□ @react-native-async-storage/async-storage
□ @react-navigation/native
□ @react-navigation/bottom-tabs
□ react-native-screens
□ react-native-safe-area-context
```

---

## 🎯 What Works Now

```
✅ Username + Password Signup
✅ Username + Password Login
✅ Real-time messaging (<1s delivery)
✅ Typing indicators
✅ Online status
✅ Friend system
✅ Overlay drawing (Android)
✅ Voice/Video calls (WebRTC ready)
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Table already exists" | Delete table → Re-run schema |
| "Function signup does not exist" | Re-run schema (pgcrypto extension) |
| "Realtime not working" | Enable in Database → Replication |
| "Cannot connect to Supabase" | Check URL + anon key in supabase.js |
| "Login fails" | Make sure password is 6+ characters |

---

## 📞 Next Steps

After setup is complete:

1. **Test Auth:** Run app → Sign up → Login
2. **Test Chat:** Open 2 emulators → Chat between them
3. **Test Realtime:** Type in one → See instantly in other
4. **Add Friends:** Test friend request flow
5. **Test Overlay:** Draw on one → Appears on other

---

**Total Time:** 5-7 minutes  
**Status:** Ready to start  
**First File:** `supabase/schema_v3_simple_auth.sql`
