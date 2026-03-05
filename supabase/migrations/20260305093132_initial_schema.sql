-- ============================================
-- FriendOverlay Database Schema v3.0
-- SIMPLIFIED AUTH: Username + Password ONLY
-- No email required for MVP
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER PROFILES (with username login)
-- ============================================

CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- Store hashed password
  avatar_url TEXT,
  status TEXT CHECK (status IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline',
  overlay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast username lookup during login
CREATE INDEX idx_profiles_username ON profiles(username);

-- ============================================
-- FRIENDS
-- ============================================

CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- OVERLAY PERMISSIONS
-- ============================================

CREATE TABLE overlay_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================
-- DRAWINGS (Overlay)
-- ============================================

CREATE TABLE drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paths JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONVERSATIONS (Chat)
-- ============================================

CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id SERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- ============================================
-- MESSAGES (Chat)
-- ============================================

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  from_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('text', 'image', 'voice', 'call_log')) DEFAULT 'text',
  text TEXT,
  media_url TEXT,
  media_type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CALL SESSIONS (Voice/Video)
-- ============================================

CREATE TABLE call_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('voice', 'video')) NOT NULL,
  status TEXT CHECK (status IN ('ringing', 'connected', 'ended', 'missed', 'declined')) DEFAULT 'ringing',
  offer JSONB,
  answer JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CALL LOGS
-- ============================================

CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('voice', 'video')) NOT NULL,
  status TEXT CHECK (status IN ('completed', 'missed', 'declined', 'failed')),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER PRESENCE (Online Status)
-- ============================================

CREATE TABLE user_presence (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT CHECK (status IN ('online', 'away', 'busy', 'offline')) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REALTIME (for instant sync)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE drawings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE call_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own + friends
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR username IS NOT NULL);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public to lookup username (for login + friend search)
CREATE POLICY "Public can view usernames" ON profiles
  FOR SELECT USING (true);

-- Friends RLS
CREATE POLICY "Users can manage own friends" ON friends
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Overlay permissions RLS
CREATE POLICY "Users manage own overlay permissions" ON overlay_permissions
  FOR ALL USING (auth.uid() = user_id);

-- Drawings RLS
CREATE POLICY "Users can send drawings" ON drawings
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "Users can receive drawings" ON drawings
  FOR SELECT USING (auth.uid() = to_id);

-- Conversations RLS
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );

-- Messages RLS
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

-- Call Sessions RLS
CREATE POLICY "Users can manage own calls" ON call_sessions
  FOR ALL USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Call Logs RLS
CREATE POLICY "Users can view own call logs" ON call_logs
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- User Presence RLS
CREATE POLICY "Users can update own presence" ON user_presence
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view friends presence" ON user_presence
  FOR SELECT USING (true); -- Allow all for MVP

-- ============================================
-- INDEXES (performance)
-- ============================================

CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_logs_user ON call_logs(caller_id, receiver_id);
CREATE INDEX idx_presence_status ON user_presence(status);

-- ============================================
-- AUTH FUNCTIONS (Username + Password)
-- ============================================

-- Signup function (create user with username + password)
CREATE OR REPLACE FUNCTION signup(username_input TEXT, password_input TEXT)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  hashed_password TEXT;
BEGIN
  -- Check if username exists
  IF EXISTS (SELECT 1 FROM profiles WHERE username = username_input) THEN
    RETURN json_build_object('error', 'Username already exists');
  END IF;
  
  -- Hash password (using pgcrypto - enable extension)
  hashed_password := crypt(password_input, gen_salt('bf'));
  
  -- Create user
  INSERT INTO profiles (username, password_hash)
  VALUES (username_input, hashed_password)
  RETURNING id INTO new_user_id;
  
  -- Create initial presence
  INSERT INTO user_presence (id, status) VALUES (new_user_id, 'offline');
  
  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Login function (verify username + password)
CREATE OR REPLACE FUNCTION login(username_input TEXT, password_input TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user and verify password
  SELECT id, username, password_hash
  INTO user_record
  FROM profiles
  WHERE username = username_input;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid username or password');
  END IF;
  
  -- Verify password
  IF user_record.password_hash = crypt(password_input, user_record.password_hash) THEN
    -- Update presence to online
    UPDATE user_presence SET status = 'online', last_seen = NOW() WHERE id = user_record.id;
    
    RETURN json_build_object(
      'success', true,
      'user_id', user_record.id,
      'username', user_record.username
    );
  ELSE
    RETURN json_build_object('error', 'Invalid username or password');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- SETUP COMPLETE
-- ============================================
