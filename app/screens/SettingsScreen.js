// ============================================
// FriendOverlay - Settings Screen
// App settings, profile, logout
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ============================================
// SettingsScreen Component
// ============================================

export default function SettingsScreen({ user, onLogout }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ============================================
  // Handle Logout
  // ============================================
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  // ============================================
  // Handle Delete Account
  // ============================================
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete account
            Alert.alert('Error', 'Delete account not implemented yet');
          },
        },
      ]
    );
  };

  // ============================================
  // Setting Item Component
  // ============================================
  const SettingItem = ({ icon, title, value, onValueChange, type = 'toggle' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#666" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor="#fff"
        />
      ) : (
        <Icon name="chevron-right" size={24} color="#ccc" />
      )}
    </View>
  );

  // ============================================
  // Menu Item Component
  // ============================================
  const MenuItem = ({ icon, title, onPress, danger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon 
          name={icon} 
          size={24} 
          color={danger ? '#F44336' : '#666'} 
        />
        <Text style={[styles.menuTitle, danger && { color: '#F44336' }]}>
          {title}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  // ============================================
  // Render
  // ============================================
  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.userId}>ID: {user?.id?.slice(0, 8)}...</Text>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem
          icon="notifications"
          title="Notifications"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SettingItem
          icon="layers"
          title="Overlay Enabled"
          value={overlayEnabled}
          onValueChange={setOverlayEnabled}
        />
        <SettingItem
          icon="dark-mode"
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem
          icon="person"
          title="Edit Profile"
          onPress={() => Alert.alert('Info', 'Edit profile not implemented yet')}
        />
        <MenuItem
          icon="lock"
          title="Change Password"
          onPress={() => Alert.alert('Info', 'Change password not implemented yet')}
        />
        <MenuItem
          icon="privacy-tip"
          title="Privacy Settings"
          onPress={() => Alert.alert('Info', 'Privacy settings not implemented yet')}
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem
          icon="help"
          title="Help Center"
          onPress={() => Alert.alert('Info', 'Help center not implemented yet')}
        />
        <MenuItem
          icon="bug-report"
          title="Report a Bug"
          onPress={() => Alert.alert('Info', 'Report bug not implemented yet')}
        />
        <MenuItem
          icon="info"
          title="About"
          onPress={() => Alert.alert('FriendOverlay', 'Version 1.0.0\n\nA real-time overlay drawing and chat app for friends.')}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <MenuItem
          icon="logout"
          title="Logout"
          onPress={handleLogout}
        />
        <MenuItem
          icon="delete-forever"
          title="Delete Account"
          onPress={handleDeleteAccount}
          danger
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>FriendOverlay v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️</Text>
      </View>
    </ScrollView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
