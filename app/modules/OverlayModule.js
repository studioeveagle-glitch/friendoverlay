// ============================================
// FriendOverlay - Overlay Module (Native Bridge)
// ============================================

import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';

const { OverlayModule } = NativeModules;

// ============================================
// Check Overlay Permission
// ============================================
export const hasOverlayPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const hasPermission = await OverlayModule.hasOverlayPermission();
    return hasPermission;
  } catch (error) {
    console.error('Check overlay permission error:', error);
    return false;
  }
};

// ============================================
// Request Overlay Permission
// ============================================
export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const hasPermission = await hasOverlayPermission();
    
    if (hasPermission) {
      return true;
    }

    // Open settings for user to grant permission
    await openOverlaySettings();
    return false; // User needs to grant manually
  } catch (error) {
    console.error('Request overlay permission error:', error);
    return false;
  }
};

// ============================================
// Open Overlay Permission Settings
// ============================================
export const openOverlaySettings = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await OverlayModule.openOverlaySettings();
  } catch (error) {
    console.error('Open overlay settings error:', error);
  }
};

// ============================================
// Start Overlay Service
// ============================================
export const startOverlayService = async () => {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Only supported on Android' };
  }

  try {
    // Check permission first
    const hasPermission = await hasOverlayPermission();
    
    if (!hasPermission) {
      return { 
        success: false, 
        error: 'Overlay permission not granted. Please grant permission in settings.' 
      };
    }

    // Start service
    const result = await OverlayModule.startService();
    return { success: true, message: result };
  } catch (error) {
    console.error('Start overlay service error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Stop Overlay Service
// ============================================
export const stopOverlayService = async () => {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Only supported on Android' };
  }

  try {
    const result = await OverlayModule.stopService();
    return { success: true, message: result };
  } catch (error) {
    console.error('Stop overlay service error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Check if Service is Running
// ============================================
export const isOverlayServiceRunning = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const isRunning = await OverlayModule.isRunning();
    return isRunning;
  } catch (error) {
    console.error('Check service running error:', error);
    return false;
  }
};

// ============================================
// Draw Paths on Overlay
// ============================================
export const drawOnOverlay = async (paths) => {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Only supported on Android' };
  }

  try {
    // Convert paths to JSON
    const pathsJson = JSON.stringify(paths);
    
    const result = await OverlayModule.drawPaths(pathsJson);
    return { success: true, message: result };
  } catch (error) {
    console.error('Draw on overlay error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Clear Overlay Drawing
// ============================================
export const clearOverlayDrawing = async () => {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Only supported on Android' };
  }

  try {
    const result = await OverlayModule.clearDrawing();
    return { success: true, message: result };
  } catch (error) {
    console.error('Clear overlay error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Permission Status
// ============================================
export const getOverlayPermissionStatus = async () => {
  if (Platform.OS !== 'android') {
    return 'unsupported';
  }

  try {
    const hasPermission = await hasOverlayPermission();
    return hasPermission ? 'granted' : 'denied';
  } catch (error) {
    return 'denied';
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Permission
  hasOverlayPermission,
  requestOverlayPermission,
  openOverlaySettings,
  getOverlayPermissionStatus,
  
  // Service
  startOverlayService,
  stopOverlayService,
  isOverlayServiceRunning,
  
  // Drawing
  drawOnOverlay,
  clearOverlayDrawing,
};
