package com.friendoverlay

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

// ============================================
// Overlay Module - React Native Bridge
// ============================================

class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "OverlayModule"
    }

    // ============================================
    // Constants
    // ============================================
    @Override
    override fun getConstants(): Map<String, Any> {
        val constants = mutableMapOf<String, Any>()
        constants["OVERLAY_PERMISSION"] = android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION
        return constants
    }

    // ============================================
    // Start Overlay Service
    // ============================================
    @ReactMethod
    fun startService(promise: Promise) {
        try {
            val intent = android.content.Intent(reactApplicationContext, OverlayService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }

            promise.resolve("Overlay service started")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Stop Overlay Service
    // ============================================
    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            val intent = android.content.Intent(reactApplicationContext, OverlayService::class.java)
            reactApplicationContext.stopService(intent)
            promise.resolve("Overlay service stopped")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Check if Service is Running
    // ============================================
    @ReactMethod
    fun isRunning(promise: Promise) {
        try {
            promise.resolve(OverlayService.isRunning)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Draw Paths on Overlay
    // ============================================
    @ReactMethod
    fun drawPaths(pathsJson: String, promise: Promise) {
        try {
            if (OverlayService.instance != null) {
                OverlayService.instance?.drawPaths(pathsJson)
                promise.resolve("Drawing sent to overlay")
            } else {
                promise.reject("ERROR", "Overlay service not running")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Clear Overlay Drawing
    // ============================================
    @ReactMethod
    fun clearDrawing(promise: Promise) {
        try {
            if (OverlayService.instance != null) {
                OverlayService.instance?.clearDrawing()
                promise.resolve("Overlay cleared")
            } else {
                promise.reject("ERROR", "Overlay service not running")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Check Overlay Permission
    // ============================================
    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        try {
            val hasPermission = android.provider.Settings.canDrawOverlays(reactApplicationContext)
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // ============================================
    // Open Overlay Permission Settings
    // ============================================
    @ReactMethod
    fun openOverlaySettings() {
        try {
            val intent = android.content.Intent(
                android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${reactApplicationContext.packageName}")
            )
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

// ============================================
// Package (Register Module)
// ============================================

class OverlayPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(OverlayModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
