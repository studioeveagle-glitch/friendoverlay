// ============================================
// FriendOverlay - Simple Auth (Username + Password)
// NO EMAIL - MVP Version
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../supabase';

// ============================================
// AuthScreen Component
// ============================================

export default function AuthScreen({ onAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkSession();
  }, []);

  // Check for existing session
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onAuthenticated(session.user);
      }
    } catch (error) {
      console.log('Session check error:', error.message);
    }
  };

  // ============================================
  // SIGNUP (Username + Password)
  // ============================================
  const handleSignup = async () => {
    // Validation
    if (!username || username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Call our custom signup function (defined in schema)
      const { data, error } = await supabase.rpc('signup', {
        username_input: username.trim(),
        password_input: password,
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        Alert.alert('Signup Failed', data.error);
        setLoading(false);
        return;
      }

      // Signup successful - auto login
      Alert.alert('Success', 'Account created! Please login.');
      setIsLogin(true);
      setUsername('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGIN (Username + Password)
  // ============================================
  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      // Call our custom login function (defined in schema)
      const { data, error } = await supabase.rpc('login', {
        username_input: username.trim(),
        password_input: password,
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        Alert.alert('Login Failed', data.error);
        setLoading(false);
        return;
      }

      // Login successful - create session
      // For MVP, we'll store user_id in AsyncStorage
      // In production, use proper Supabase auth session
      await supabase.auth.signInWithPassword({
        email: `${data.user_id}@friendoverlay.app`, // Fake email for Supabase auth
        password: password,
      });

      // Notify parent component
      onAuthenticated({
        id: data.user_id,
        username: data.username,
      });

    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback: Direct login without Supabase auth session
      // (for MVP simplicity)
      try {
        const { data } = await supabase.rpc('login', {
          username_input: username.trim(),
          password_input: password,
        });
        
        if (data && data.success) {
          // Store user info in AsyncStorage for MVP
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('user_id', data.user_id);
          await AsyncStorage.setItem('username', data.username);
          
          onAuthenticated({
            id: data.user_id,
            username: data.username,
          });
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback login error:', fallbackError);
      }
      
      Alert.alert('Login Failed', 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>FriendOverlay</Text>
          <Text style={styles.subtitle}>
            Draw & Chat Over Any App
          </Text>
        </View>

        {/* Auth Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setUsername('');
              setPassword('');
              setConfirmPassword('');
            }}
            disabled={loading}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Simple username + password auth
          </Text>
          <Text style={styles.footerText}>
            No email required for MVP
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#99c9ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
});
