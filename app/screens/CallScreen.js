// ============================================
// FriendOverlay - Call Screen
// Voice and Video call interface with WebRTC
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RTCView } from 'react-native-webrtc';
import { supabase } from '../supabase';
import WebRTCCall, {
  startCall,
  answerCall,
  endCall,
  toggleMute,
  toggleCamera,
  switchCamera,
  addIceCandidate,
} from '../modules/WebRTCCall';

// ============================================
// CallScreen Component
// ============================================

export default function CallScreen({ route, navigation }) {
  const { friendId, friendUsername, callType = 'voice', callSession } = route.params || {};
  
  const [callStatus, setCallStatus] = useState('calling'); // calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(callType === 'video');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    // Initialize call
    initializeCall();

    return () => {
      // Cleanup on unmount
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callStatus]);

  // ============================================
  // Initialize Call
  // ============================================
  const initializeCall = async () => {
    try {
      if (callSession) {
        // Answering incoming call
        const result = await answerCall(
          callSession,
          handleIceCandidate,
          handleRemoteTrack
        );

        if (result.success) {
          setLocalStream(result.stream);
          setCallStatus('connected');
        } else {
          Alert.alert('Error', result.error);
          setTimeout(() => navigation.goBack(), 2000);
        }
      } else {
        // Starting outgoing call
        const result = await startCall(
          friendId,
          callType,
          handleIceCandidate,
          handleRemoteTrack
        );

        if (result.success) {
          setLocalStream(result.stream);
          setCallStatus('calling');
        } else {
          Alert.alert('Error', result.error);
          setTimeout(() => navigation.goBack(), 2000);
        }
      }

      // Subscribe to call updates
      subscribeToCallUpdates();
    } catch (error) {
      console.error('Initialize call error:', error);
      Alert.alert('Error', error.message);
      setTimeout(() => navigation.goBack(), 2000);
    }
  };

  // ============================================
  // Subscribe to Call Updates (Real-time)
  // ============================================
  const subscribeToCallUpdates = () => {
    const channelId = callSession?.id || friendId;
    
    const channel = supabase
      .channel(`call:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
        },
        async (payload) => {
          if (payload.new.status === 'ended') {
            setCallStatus('ended');
            Alert.alert('Call Ended', 'The call has ended');
            setTimeout(() => navigation.goBack(), 2000);
          } else if (payload.new.status === 'connected' && callStatus === 'calling') {
            setCallStatus('connected');
          } else if (payload.new.answer && !callSession) {
            // Received answer from receiver
            await WebRTCCall.peerConnection?.setRemoteDescription(
              new RTCSessionDescription(payload.new.answer)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // ============================================
  // Handle ICE Candidate
  // ============================================
  const handleIceCandidate = async (candidate) => {
    try {
      // Send ICE candidate to other peer via Supabase
      await supabase
        .from('call_sessions')
        .update({
          ice_candidates_caller: callSession?.caller_id === (await supabase.auth.getUser()).user.id
            ? [...(callSession.ice_candidates_caller || []), candidate]
            : callSession.ice_candidates_caller,
          ice_candidates_receiver: callSession?.receiver_id === (await supabase.auth.getUser()).user.id
            ? [...(callSession.ice_candidates_receiver || []), candidate]
            : callSession.ice_candidates_receiver,
        })
        .eq('id', callSession?.id);
    } catch (error) {
      console.error('ICE candidate error:', error);
    }
  };

  // ============================================
  // Handle Remote Track
  // ============================================
  const handleRemoteTrack = (stream) => {
    setRemoteStream(stream);
  };

  // ============================================
  // Cleanup
  // ============================================
  const cleanup = async () => {
    await endCall();
    setLocalStream(null);
    setRemoteStream(null);
  };

  // ============================================
  // Format Duration
  // ============================================
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // End Call
  // ============================================
  const endCallHandler = async () => {
    await cleanup();
    setCallStatus('ended');
    setTimeout(() => navigation.goBack(), 1000);
  };

  // ============================================
  // Toggle Mute
  // ============================================
  const toggleMuteHandler = () => {
    setIsMuted(!isMuted);
    toggleMute(!isMuted);
  };

  // ============================================
  // Toggle Speaker
  // ============================================
  const toggleSpeakerHandler = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // TODO: Implement actual speaker toggle with InCallManager
  };

  // ============================================
  // Toggle Camera
  // ============================================
  const toggleCameraHandler = () => {
    setIsCameraOn(!isCameraOn);
    toggleCamera(!isCameraOn);
  };

  // ============================================
  // Switch Camera
  // ============================================
  const switchCameraHandler = async () => {
    setIsFrontCamera(!isFrontCamera);
    await switchCamera();
  };

  // ============================================
  // Render
  // ============================================
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.background} />

      {/* Friend Info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {friendUsername?.charAt(0)?.toUpperCase() || 'F'}
            </Text>
          </View>
          <Text style={styles.friendName}>{friendUsername || 'Friend'}</Text>
          <Text style={styles.callStatus}>
            {callStatus === 'calling' && 'Calling...'}
            {callStatus === 'connected' && formatDuration(callDuration)}
            {callStatus === 'ended' && 'Call Ended'}
          </Text>
          <Text style={styles.callType}>
            {callType === 'voice' ? 'Voice Call' : 'Video Call'}
          </Text>
        </View>
      </View>

      {/* Video Preview (for video calls) */}
      {callType === 'video' && (
        <View style={styles.videoContainer}>
          {/* Remote Video */}
          {remoteStream && (
            <View style={styles.remoteVideo}>
              <RTCView streamURL={remoteStream.toURL()} style={styles.videoView} />
            </View>
          )}
          
          {/* Local Video (Picture-in-Picture) */}
          {localStream && isCameraOn && (
            <View style={styles.localVideo}>
              <RTCView streamURL={localStream.toURL()} style={styles.videoView} />
            </View>
          )}
        </View>
      )}

      {/* Call Controls */}
      <View style={styles.controls}>
        {/* Top Row */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMuteHandler}
          >
            <Icon
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={isMuted ? '#fff' : '#333'}
            />
            <Text style={styles.controlText}>Mute</Text>
          </TouchableOpacity>

          {callType === 'video' && (
            <>
              <TouchableOpacity
                style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
                onPress={toggleCameraHandler}
              >
                <Icon
                  name={isCameraOn ? 'videocam' : 'videocam-off'}
                  size={28}
                  color={isCameraOn ? '#333' : '#fff'}
                />
                <Text style={styles.controlText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={switchCameraHandler}
              >
                <Icon name="cameraswitch" size={28} color="#333" />
                <Text style={styles.controlText}>Switch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                onPress={toggleSpeakerHandler}
              >
                <Icon
                  name={isSpeakerOn ? 'volume-up' : 'volume-off'}
                  size={28}
                  color={isSpeakerOn ? '#fff' : '#333'}
                />
                <Text style={styles.controlText}>Speaker</Text>
              </TouchableOpacity>
            </>
          )}

          {callType === 'voice' && (
            <TouchableOpacity
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={toggleSpeakerHandler}
            >
              <Icon
                name={isSpeakerOn ? 'volume-up' : 'volume-off'}
                size={28}
                color={isSpeakerOn ? '#fff' : '#333'}
              />
              <Text style={styles.controlText}>Speaker</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* End Call Button */}
        <View style={styles.endCallContainer}>
          <TouchableOpacity style={styles.endCallButton} onPress={endCallHandler}>
            <Icon name="call-end" size={36} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.endCallText}>End Call</Text>
        </View>
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
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 4,
  },
  callType: {
    fontSize: 16,
    color: '#999',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  videoView: {
    flex: 1,
  },
  controls: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#4CAF50',
  },
  controlText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  endCallContainer: {
    alignItems: 'center',
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  endCallText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
