// ============================================
// FriendOverlay - WebRTC Call Module
// Handles voice/video calls with WebRTC
// ============================================

import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { supabase } from '../supabase';

// ============================================
// WebRTC Configuration (STUN/TURN Servers)
// ============================================

const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Optional: Add TURN server for better connectivity
    // {
    //   urls: 'turn:your-turn-server.com',
    //   username: 'user',
    //   credential: 'pass'
    // }
  ],
};

// ============================================
// Call Manager Class
// ============================================

class WebRTCCallManager {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.currentCall = null;
  }

  // ============================================
  // Initialize Local Media (Camera/Mic)
  // ============================================
  async initializeLocalMedia(enableVideo = true) {
    try {
      // Request permissions
      InCallManager.start({ media: enableVideo ? 'video' : 'audio' });

      // Get local stream
      const constraints = {
        audio: true,
        video: enableVideo
          ? {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 },
            }
          : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;

      return { success: true, stream };
    } catch (error) {
      console.error('Initialize local media error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Create Peer Connection
  // ============================================
  createPeerConnection(onIceCandidate, onTrack) {
    try {
      this.peerConnection = new RTCPeerConnection(rtcConfiguration);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          onIceCandidate(event.candidate);
        }
      };

      // Handle remote track
      this.peerConnection.ontrack = (event) => {
        if (onTrack && event.streams[0]) {
          this.remoteStream = event.streams[0];
          onTrack(event.streams[0]);
        }
      };

      return { success: true };
    } catch (error) {
      console.error('Create peer connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Start Call (Caller)
  // ============================================
  async startCall(friendId, callType = 'voice', onIceCandidate, onTrack) {
    try {
      // Initialize media
      const mediaResult = await this.initializeLocalMedia(callType === 'video');
      if (!mediaResult.success) return mediaResult;

      // Create peer connection
      const pcResult = this.createPeerConnection(onIceCandidate, onTrack);
      if (!pcResult.success) return pcResult;

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });

      await this.peerConnection.setLocalDescription(offer);

      // Save call to database
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          caller_id: (await supabase.auth.getUser()).user.id,
          receiver_id: friendId,
          type: callType,
          status: 'ringing',
          offer: offer,
        })
        .select()
        .single();

      if (error) throw error;

      this.currentCall = data;

      return {
        success: true,
        callId: data.id,
        stream: this.localStream,
      };
    } catch (error) {
      console.error('Start call error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Answer Call (Receiver)
  // ============================================
  async answerCall(callSession, onIceCandidate, onTrack) {
    try {
      // Initialize media
      const mediaResult = await this.initializeLocalMedia(callSession.type === 'video');
      if (!mediaResult.success) return mediaResult;

      // Create peer connection
      const pcResult = this.createPeerConnection(onIceCandidate, onTrack);
      if (!pcResult.success) return pcResult;

      // Set remote description (offer)
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(callSession.offer)
      );

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Update call status
      await supabase
        .from('call_sessions')
        .update({
          status: 'connected',
          answer: answer,
        })
        .eq('id', callSession.id);

      this.currentCall = callSession;

      return {
        success: true,
        stream: this.localStream,
      };
    } catch (error) {
      console.error('Answer call error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Add ICE Candidate
  // ============================================
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      return { success: true };
    } catch (error) {
      console.error('Add ICE candidate error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Toggle Mute
  // ============================================
  toggleMute(muted) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
    }
  }

  // ============================================
  // Toggle Camera
  // ============================================
  toggleCamera(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  // ============================================
  // Switch Camera
  // ============================================
  async switchCamera() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          if (capabilities.facingMode) {
            await videoTrack.applyConstraints({
              advanced: [{ facingMode: videoTrack.label.includes('front') ? 'environment' : 'user' }],
            });
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Switch camera error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // End Call
  // ============================================
  async endCall() {
    try {
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Update call in database
      if (this.currentCall) {
        await supabase
          .from('call_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
          })
          .eq('id', this.currentCall.id);

        // Save to call logs
        await supabase.from('call_logs').insert({
          caller_id: this.currentCall.caller_id,
          receiver_id: this.currentCall.receiver_id,
          type: this.currentCall.type,
          status: 'completed',
        });

        this.currentCall = null;
      }

      // Stop in-call manager
      InCallManager.stop();

      return { success: true };
    } catch (error) {
      console.error('End call error:', error);
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// Export Singleton Instance
// ============================================

const webRTCCallManager = new WebRTCCallManager();

export default webRTCCallManager;

// ============================================
// Helper Functions
// ============================================

export const startCall = async (friendId, callType, onIceCandidate, onTrack) => {
  return await webRTCCallManager.startCall(friendId, callType, onIceCandidate, onTrack);
};

export const answerCall = async (callSession, onIceCandidate, onTrack) => {
  return await webRTCCallManager.answerCall(callSession, onIceCandidate, onTrack);
};

export const endCall = async () => {
  return await webRTCCallManager.endCall();
};

export const toggleMute = (muted) => {
  webRTCCallManager.toggleMute(muted);
};

export const toggleCamera = (enabled) => {
  webRTCCallManager.toggleCamera(enabled);
};

export const switchCamera = async () => {
  return await webRTCCallManager.switchCamera();
};

export const addIceCandidate = async (candidate) => {
  return await webRTCCallManager.addIceCandidate(candidate);
};
