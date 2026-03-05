// ============================================
// FriendOverlay - Real-Time Chat Screen
// Supabase Realtime Messaging
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ChatScreen Component
// ============================================

export default function ChatScreen({ route }) {
  const { friendId, friendUsername } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  // ============================================
  // LOAD USER + CONVERSATION ON MOUNT
  // ============================================
  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadOrCreateConversation();
    }
  }, [currentUser]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
    }

    // Cleanup subscription on unmount
    return () => {
      if (conversationId) {
        unsubscribeFromMessages();
      }
    };
  }, [conversationId]);

  // Load current user
  const loadUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const username = await AsyncStorage.getItem('username');
      setCurrentUser({ id: userId, username });
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  // Load or create conversation with friend
  const loadOrCreateConversation = async () => {
    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .in('id', (
          await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUser.id)
        ).data?.map(p => p.conversation_id) || [])
        .single();

      if (existing) {
        setConversationId(existing.id);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ type: 'direct' })
          .select()
          .single();

        if (error) throw error;

        // Add participants
        await supabase.from('conversation_participants').insert([
          { conversation_id: newConv.id, user_id: currentUser.id },
          { conversation_id: newConv.id, user_id: friendId },
        ]);

        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error('Load conversation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD MESSAGES
  // ============================================
  const loadMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, from_id, text, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(data || []);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REAL-TIME SUBSCRIPTION
  // ============================================
  let channel = null;

  const subscribeToMessages = () => {
    if (!conversationId) return;

    channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // New message received in real-time!
          console.log('📨 New message received:', payload.new);

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new];
          });

          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);

          // Play notification sound (if not from current user)
          if (payload.new.from_id !== currentUser.id) {
            // TODO: Play sound
          }
        }
      )
      .subscribe();
  };

  const unsubscribeFromMessages = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };

  // ============================================
  // SEND MESSAGE
  // ============================================
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !conversationId) return;

    setSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          from_id: currentUser.id,
          type: 'text',
          text: newMessage.trim(),
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message sent:', data);

      // Clear input
      setNewMessage('');

      // Message will appear in real-time via subscription
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // MARK MESSAGE AS READ
  // ============================================
  const markAsRead = async (messageId) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('to_id', currentUser.id);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // ============================================
  // RENDER MESSAGE
  // ============================================
  const renderMessage = ({ item }) => {
    const isFromMe = item.from_id === currentUser?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isFromMe ? styles.myMessage : styles.friendMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isFromMe ? styles.myBubble : styles.friendBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text
            style={[
              styles.messageTime,
              isFromMe ? styles.myTime : styles.friendTime,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Read Receipt */}
        {isFromMe && item.read && (
          <Text style={styles.readReceipt}>✓✓</Text>
        )}
      </View>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{friendUsername}</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  friendMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  friendBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'right',
  },
  myTime: {
    color: '#fff',
  },
  friendTime: {
    color: '#666',
  },
  readReceipt: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 2,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
