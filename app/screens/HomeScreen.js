// ============================================
// FriendOverlay - Home Screen
// Shows recent chats, online friends, quick actions
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../supabase';

// ============================================
// HomeScreen Component
// ============================================

export default function HomeScreen({ user, navigation }) {
  const [friends, setFriends] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
    loadRecentChats();
  }, []);

  const loadFriends = async () => {
    try {
      // Get friends list
      const { data: friendsData, error } = await supabase
        .from('friends')
        .select(`
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

      setFriends(friendsData || []);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const loadRecentChats = async () => {
    try {
      // Get recent conversations
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          updated_at,
          conversation_participants!inner (
            user_id
          ),
          messages (
            id,
            text,
            from_id,
            created_at
          )
        `)
        .in('id', (
          await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id)
        ).data?.map(c => c.conversation_id) || [])
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentChats(conversations || []);
    } catch (error) {
      console.error('Load recent chats error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFriends();
    loadRecentChats();
  };

  // ============================================
  // Render Friend Item
  // ============================================
  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('Chat', {
        friendId: item.friend_id,
        friendUsername: item.profiles?.username || 'Friend',
      })}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.profiles?.username?.charAt(0)?.toUpperCase() || 'F'}
          </Text>
        </View>
        <View style={[
          styles.statusDot,
          { backgroundColor: item.profiles?.status === 'online' ? '#4CAF50' : '#ccc' }
        ]} />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.profiles?.username || 'Friend'}
        </Text>
        <Text style={styles.friendStatus}>
          {item.profiles?.status || 'Offline'}
        </Text>
      </View>
      <Icon name="chat-bubble-outline" size={24} color="#007AFF" />
    </TouchableOpacity>
  );

  // ============================================
  // Render Recent Chat Item
  // ============================================
  const renderChat = ({ item }) => {
    const lastMessage = item.messages?.[0];
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
        })}
      >
        <View style={styles.chatInfo}>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {lastMessage?.text || 'No messages yet'}
          </Text>
          <Text style={styles.chatTime}>
            {lastMessage?.created_at 
              ? new Date(lastMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================
  // Render
  // ============================================
  return (
    <View style={styles.container}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Friends')}
        >
          <Icon name="people" size={32} color="#007AFF" />
          <Text style={styles.actionText}>Add Friend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Draw')}
        >
          <Icon name="brush" size={32} color="#4CAF50" />
          <Text style={styles.actionText}>Draw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={32} color="#FF9800" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Online Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Friends</Text>
        <FlatList
          data={friends.filter(f => f.profiles?.status === 'online')}
          renderItem={renderFriend}
          keyExtractor={(item) => item.friend_id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      {/* All Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Friends</Text>
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.friend_id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      {/* Recent Chats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Chats</Text>
        <FlatList
          data={recentChats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
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
  friendsList: {
    paddingHorizontal: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
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
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
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
  chatItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatPreview: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
});
