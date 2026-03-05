// ============================================
// FriendOverlay - Friends Screen
// Add friends, manage friend requests, toggle overlay permissions
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../supabase';

// ============================================
// FriendsScreen Component
// ============================================

export default function FriendsScreen({ user }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [overlayPermissions, setOverlayPermissions] = useState({});

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
    loadOverlayPermissions();
  }, []);

  // ============================================
  // Load Friends
  // ============================================
  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          friend_id,
          profiles:friend_id (
            id,
            username,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      setFriends(data || []);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  // ============================================
  // Load Pending Requests
  // ============================================
  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          profiles:user_id (
            id,
            username
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      setPendingRequests(data || []);
    } catch (error) {
      console.error('Load pending requests error:', error);
    }
  };

  // ============================================
  // Load Overlay Permissions
  // ============================================
  const loadOverlayPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('overlay_permissions')
        .select('friend_id, allowed')
        .eq('user_id', user.id);

      if (error) throw error;

      const permissions = {};
      data.forEach(p => {
        permissions[p.friend_id] = p.allowed;
      });
      setOverlayPermissions(permissions);
    } catch (error) {
      console.error('Load overlay permissions error:', error);
    }
  };

  // ============================================
  // Add Friend
  // ============================================
  const addFriend = async () => {
    if (!searchUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      // Find user by username
      const { data: friendUser, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', searchUsername.trim())
        .single();

      if (findError || !friendUser) {
        Alert.alert('Error', 'User not found');
        return;
      }

      if (friendUser.id === user.id) {
        Alert.alert('Error', 'Cannot add yourself');
        return;
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', friendUser.id)
        .single();

      if (existing) {
        Alert.alert('Error', 'Already friends or request pending');
        return;
      }

      // Send friend request
      const { error: insertError } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendUser.id,
          status: 'pending',
        });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Friend request sent!');
      setSearchUsername('');
      loadPendingRequests();
    } catch (error) {
      console.error('Add friend error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // Accept Friend Request
  // ============================================
  const acceptFriendRequest = async (requestId, friendId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Success', 'Friend request accepted!');
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Accept friend error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // Reject Friend Request
  // ============================================
  const rejectFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Success', 'Friend request rejected');
      loadPendingRequests();
    } catch (error) {
      console.error('Reject friend error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // Toggle Overlay Permission
  // ============================================
  const toggleOverlayPermission = async (friendId, currentValue) => {
    try {
      const newValue = !currentValue;

      const { error } = await supabase
        .from('overlay_permissions')
        .upsert({
          user_id: user.id,
          friend_id: friendId,
          allowed: newValue,
        });

      if (error) throw error;

      setOverlayPermissions(prev => ({
        ...prev,
        [friendId]: newValue,
      }));
    } catch (error) {
      console.error('Toggle overlay permission error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // ============================================
  // Render Friend Item
  // ============================================
  const renderFriend = ({ item }) => (
    <View style={styles.friendItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.profiles?.username?.charAt(0)?.toUpperCase() || 'F'}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.profiles?.username || 'Friend'}
        </Text>
        <Text style={styles.friendStatus}>
          {item.profiles?.status || 'Offline'}
        </Text>
      </View>
      <View style={styles.overlayToggle}>
        <Text style={styles.overlayLabel}>Overlay:</Text>
        <Switch
          value={overlayPermissions[item.friend_id] || false}
          onValueChange={(value) => toggleOverlayPermission(item.friend_id, overlayPermissions[item.friend_id])}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  // ============================================
  // Render Pending Request
  // ============================================
  const renderPendingRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.profiles?.username || 'User'}
        </Text>
        <Text style={styles.requestStatus}>Wants to be friends</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptFriendRequest(item.id, item.user_id)}
        >
          <Icon name="check" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectFriendRequest(item.id)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================
  // Render
  // ============================================
  return (
    <View style={styles.container}>
      {/* Add Friend Section */}
      <View style={styles.addFriendSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter username to add friend"
          value={searchUsername}
          onChangeText={setSearchUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={addFriend}>
          <Icon name="person-add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests ({pendingRequests.length})</Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequest}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Friends List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Friends ({friends.length})</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
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
  addFriendSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  overlayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  requestStatus: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
