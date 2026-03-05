// ============================================
// FriendOverlay - Main App Entry Point
// ============================================

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import FriendsScreen from './screens/FriendsScreen';
import ChatScreen from './screens/ChatScreen';
import DrawScreen from './screens/DrawScreen';
import SettingsScreen from './screens/SettingsScreen';
import CallScreen from './screens/CallScreen';

// Supabase
import { getCurrentUser, logout } from './supabase';

// ============================================
// Navigation Setup
// ============================================

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ============================================
// Main App Component
// ============================================

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading FriendOverlay...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated User
          <Stack.Screen name="Main">
            {(props) => <MainTabs {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          // Not Authenticated
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onAuthenticated={setUser} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============================================
// Main Tab Navigator
// ============================================

function MainTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outlined';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Draw') {
            iconName = focused ? 'brush' : 'brush-outlined';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outlined';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        children={() => <HomeScreen user={user} />}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Friends" 
        children={() => <FriendsScreen user={user} />}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen 
        name="Draw" 
        children={() => <DrawScreen user={user} />}
        options={{ title: 'Draw' }}
      />
      <Tab.Screen 
        name="Settings" 
        children={() => <SettingsScreen user={user} onLogout={onLogout} />}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
