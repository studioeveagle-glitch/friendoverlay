# 🗄 Database Setup Guide (DO THIS FIRST)

**Time:** 10 minutes  
**Cost:** $0  
**Priority:** CRITICAL ⚠️

---

## 📋 What You'll Create

```
✅ Supabase project (Free Tier)
✅ 7 tables (profiles, friends, drawings, etc.)
✅ Realtime enabled (instant sync)
✅ Row-level security (RLS)
✅ API credentials for app
```

---

## 🚀 Option 1: Manual Setup (Easiest)

### **Step 1: Create Supabase Account (2 min)**

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign In"**
3. Sign up with GitHub or Email
4. Verify email (if using email)

---

### **Step 2: Create New Project (2 min)**

1. Click **"New Project"** (dashboard)
2. Fill in:
   ```
   Organization: [Your name]
   Project name: FriendOverlay
   Database password: [Generate secure password - SAVE IT!]
   Region: [Closest to you]
   ```
3. Click **"Create new project"**
4. Wait 2-3 minutes (provisioning)

---

### **Step 3: Paste Schema (3 min)**

1. Click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. **Copy entire schema below** → Paste
4. Click **"Run"** (or Ctrl+Enter)
5. Verify: "Success. No rows returned"

---

### **Step 4: Enable Realtime (1 min)**

1. Click **"Database"** (left sidebar)
2. Click **"Replication"**
3. Find `drawings` table → Toggle **"Enable Realtime"** ✓
4. Find `messages` table → Toggle **"Enable Realtime"** ✓

---

### **Step 5: Get Credentials (1 min)**

1. Click **"Settings"** (gear icon, bottom left)
2. Click **"API"**
3. Copy these 2 values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbG... (long string)
   ```
4. **SAVE THESE** (needed for `app/supabase.js`)

---

### **Step 6: Verify Setup (1 min)**

1. Click **"Table Editor"** (left sidebar)
2. You should see 7 tables:
   ```
   ✓ profiles
   ✓ friends
   ✓ overlay_permissions
   ✓ drawings
   ✓ messages
   ✓ target_apps
   ✓ overlay_sessions
   ```
3. ✅ **DONE!** Backend is ready!

---

## 📜 Complete Schema (Copy-Paste This)

```sql
-- ============================================
-- FriendOverlay Database Schema
-- Version: 1.0
-- Copy-paste ENTIRE file to SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends Supabase auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  overlay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend relationships (many-to-many)
CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Per-friend overlay permissions
CREATE TABLE overlay_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Real-time drawings (paths as JSON)
CREATE TABLE drawings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Text messages (chat)
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Target apps (which apps allow overlay)
CREATE TABLE target_apps (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  app_name TEXT,
  overlay_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, package_name)
);

-- Overlay sessions (track active sessions)
CREATE TABLE overlay_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true
);

-- ============================================
-- REALTIME (for instant sync)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE drawings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE overlay_sessions;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/update own + view friends
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view friends profiles" ON profiles
  FOR SELECT USING (id IN (
    SELECT friend_id FROM friends 
    WHERE user_id = auth.uid() AND status = 'accepted'
  ));

-- Friends: Users can manage own friend requests
CREATE POLICY "Users can manage own friends" ON friends
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Overlay permissions: Users control who can overlay
CREATE POLICY "Users manage own overlay permissions" ON overlay_permissions
  FOR ALL USING (auth.uid() = user_id);

-- Drawings: Only send/receive with permitted friends
CREATE POLICY "Users can send drawings" ON drawings
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "Users can receive drawings" ON drawings
  FOR SELECT USING (
    auth.uid() = to_id AND 
    EXISTS (
      SELECT 1 FROM overlay_permissions 
      WHERE user_id = to_id AND friend_id = from_id AND allowed = true
    )
  );

-- Messages: Chat participants only
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

-- Target apps: Users manage own app list
CREATE POLICY "Users manage own target apps" ON target_apps
  FOR ALL USING (auth.uid() = user_id);

-- Overlay sessions: Track own sessions
CREATE POLICY "Users manage own sessions" ON overlay_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES (performance)
-- ============================================

CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_drawings_from ON drawings(from_id);
CREATE INDEX idx_drawings_to ON drawings(to_id);
CREATE INDEX idx_drawings_created ON drawings(created_at DESC);
CREATE INDEX idx_messages_from ON messages(from_id);
CREATE INDEX idx_messages_to ON messages(to_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_overlay_permissions_user ON overlay_permissions(user_id);
CREATE INDEX idx_overlay_permissions_friend ON overlay_permissions(friend_id);
CREATE INDEX idx_target_apps_user ON target_apps(user_id);
CREATE INDEX idx_overlay_sessions_active ON overlay_sessions(active) WHERE active = true;

-- ============================================
-- TRIGGERS (auto-create profile on signup)
-- ============================================

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ============================================
-- SETUP COMPLETE
-- ============================================
```

---

## 🧪 Option 2: CLI Setup (Advanced)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
winget install Supabase.CLI         # Windows

# Login
supabase login

# Create project
supabase projects create --name FriendOverlay

# Save schema.sql (from above) then:
supabase db execute --file schema.sql

# Get credentials
supabase projects api-keys list
```

---

## ✅ Verification Checklist

```
□ Can access Supabase dashboard
□ Project "FriendOverlay" exists
□ 7 tables visible in Table Editor
□ drawings table has "Realtime" enabled
□ messages table has "Realtime" enabled
□ Have Project URL copied
□ Have anon key copied
□ Database password saved securely
```

---

## 🔑 Next Steps

After database is set up:

1. **Create `app/supabase.js`** → Paste credentials
2. **Create `app/screens/AuthScreen.js`** → Test signup
3. **Verify profile created** → Check Table Editor

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Table already exists" | Delete table → Run schema again |
| "Permission denied" | Use anon key (not service_role) |
| "Realtime not working" | Enable in Database → Replication |
| "Can't signup" | Check email confirmation settings |

---

**Status:** ⬜ Not Started → 🔄 In Progress → ✅ Complete  
**Next File:** `scripts/setup_supabase.sh` (auto-setup script)
