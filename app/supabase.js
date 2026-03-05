// ============================================
// FriendOverlay - Supabase Client
// Simple Auth (Username + Password)
// ============================================

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONFIGURATION
// Replace these with your Supabase credentials
// ============================================

const SUPABASE_URL = 'https://bpgqgbbccdervaputuks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZ3FnYmJjY2RlcnZhcHV0dWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTU5OTYsImV4cCI6MjA4ODI3MTk5Nn0.OxKnAFNyynUqO3TRnbBJZvWaDOimrkHQ92DLIWrmc04';

// ============================================
// CREATE SUPABASE CLIENT
// ============================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // Disable for MVP (simple auth)
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
// AUTH HELPERS (Username + Password)
// ============================================

/**
 * Signup with username + password
 */
export const signup = async (username, password) => {
  try {
    const { data, error } = await supabase.rpc('signup', {
      username_input: username.trim(),
      password_input: password,
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login with username + password
 */
export const login = async (username, password) => {
  try {
    const { data, error } = await supabase.rpc('login', {
      username_input: username.trim(),
      password_input: password,
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);

    // Store user info in AsyncStorage
    await AsyncStorage.setItem('user_id', data.user_id);
    await AsyncStorage.setItem('username', data.username);

    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    await AsyncStorage.multiRemove(['user_id', 'username']);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user from AsyncStorage
 */
export const getCurrentUser = async () => {
  try {
    const [userId, username] = await AsyncStorage.multiGet([
      'user_id',
      'username',
    ]);

    if (userId[1]) {
      return {
        id: userId[1],
        username: username[1],
      };
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  const user = await getCurrentUser();
  return user !== null;
};

// ============================================
// EXPORTS
// ============================================

export default supabase;
