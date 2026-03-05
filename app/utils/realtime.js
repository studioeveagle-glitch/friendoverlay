// ============================================
// FriendOverlay - Real-Time Features
// Typing Indicators, Online Status, Message Delivery
// ============================================

import { supabase } from '../supabase';

// ============================================
// TYPING INDICATORS
// ============================================

let typingChannel = null;

/**
 * Subscribe to typing indicators for a conversation
 */
export const subscribeToTyping = (conversationId, onTypingUpdate) => {
  if (!conversationId) return;

  typingChannel = supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log('📝 Typing update:', payload);
        onTypingUpdate(payload.new);
      }
    )
    .subscribe();
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = async (conversationId, userId, isTyping) => {
  if (!conversationId || !userId) return;

  try {
    // Upsert typing indicator
    const { data, error } = await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      })
      .single();

    if (error) throw error;

    // Auto-clear after 3 seconds
    setTimeout(async () => {
      await supabase
        .from('typing_indicators')
        .update({ is_typing: false })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);
    }, 3000);
  } catch (error) {
    console.error('Send typing error:', error);
  }
};

/**
 * Unsubscribe from typing indicators
 */
export const unsubscribeFromTyping = () => {
  if (typingChannel) {
    supabase.removeChannel(typingChannel);
    typingChannel = null;
  }
};

// ============================================
// ONLINE STATUS (PRESENCE)
// ============================================

let presenceChannel = null;

/**
 * Subscribe to friend's online status
 */
export const subscribeToPresence = (friendIds, onStatusUpdate) => {
  if (!friendIds || friendIds.length === 0) return;

  presenceChannel = supabase
    .channel('presence')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_presence',
      },
      (payload) => {
        console.log('🟢 Status update:', payload);
        onStatusUpdate(payload.new);
      }
    )
    .subscribe();

  // Load initial status
  loadPresence(friendIds, onStatusUpdate);
};

/**
 * Load initial online status for friends
 */
const loadPresence = async (friendIds, onStatusUpdate) => {
  try {
    const { data, error } = await supabase
      .from('user_presence')
      .select('id, status, last_seen')
      .in('id', friendIds);

    if (error) throw error;

    data.forEach((friend) => {
      onStatusUpdate(friend);
    });
  } catch (error) {
    console.error('Load presence error:', error);
  }
};

/**
 * Update own online status
 */
export const updatePresence = async (userId, status) => {
  if (!userId) return;

  try {
    await supabase
      .from('user_presence')
      .upsert({
        id: userId,
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Update presence error:', error);
  }
};

/**
 * Unsubscribe from presence
 */
export const unsubscribeFromPresence = () => {
  if (presenceChannel) {
    supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
};

// ============================================
// MESSAGE DELIVERY & READ RECEIPTS
// ============================================

/**
 * Mark message as delivered
 */
export const markMessageDelivered = async (messageId) => {
  try {
    await supabase
      .from('messages')
      .update({ delivered: true })
      .eq('id', messageId);
  } catch (error) {
    console.error('Mark delivered error:', error);
  }
};

/**
 * Mark message as read
 */
export const markMessageRead = async (messageId) => {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
  } catch (error) {
    console.error('Mark read error:', error);
  }
};

/**
 * Mark all messages in conversation as read
 */
export const markAllRead = async (conversationId, userId) => {
  try {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('to_id', userId)
      .eq('read', false);
  } catch (error) {
    console.error('Mark all read error:', error);
  }
};

// ============================================
// REAL-TIME CALL STATUS
// ============================================

let callChannel = null;

/**
 * Subscribe to incoming calls
 */
export const subscribeToCalls = (userId, onCallUpdate) => {
  if (!userId) return;

  callChannel = supabase
    .channel(`calls:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'call_sessions',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        console.log('📞 Call update:', payload);
        onCallUpdate(payload.new);
      }
    )
    .subscribe();
};

/**
 * Update call status
 */
export const updateCallStatus = async (callId, status, additionalData = {}) => {
  try {
    const updateData = {
      status,
      ...additionalData,
      ...(status === 'ended' ? { ended_at: new Date().toISOString() } : {}),
    };

    await supabase
      .from('call_sessions')
      .update(updateData)
      .eq('id', callId);
  } catch (error) {
    console.error('Update call error:', error);
  }
};

/**
 * Unsubscribe from calls
 */
export const unsubscribeFromCalls = () => {
  if (callChannel) {
    supabase.removeChannel(callChannel);
    callChannel = null;
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Typing
  subscribeToTyping,
  sendTypingIndicator,
  unsubscribeFromTyping,

  // Presence
  subscribeToPresence,
  updatePresence,
  unsubscribeFromPresence,

  // Messages
  markMessageDelivered,
  markMessageRead,
  markAllRead,

  // Calls
  subscribeToCalls,
  updateCallStatus,
  unsubscribeFromCalls,
};
