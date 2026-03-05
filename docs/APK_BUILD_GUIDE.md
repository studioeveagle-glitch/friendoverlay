# 📱 **FriendOverlay - APK Build Guide**

---

## ⚠️ **IMPORTANT: Two Build Options**

### **Option 1: Quick Build (Recommended for Testing)**
Use React Native's development mode - no APK needed!

```bash
cd /root/FriendOverlay/app
npm install
npx react-native start

# Then on your Android device:
# 1. Install "React Native Debugger" app
# 2. Connect to same WiFi
# 3. Load app via debugger
```

### **Option 2: Full APK Build**
Creates standalone APK file - takes 10-20 minutes!

---

## 🔨 **FULL APK BUILD STEPS**

### **Prerequisites:**
```
✅ Java JDK 17
✅ Android SDK (API 34)
✅ Android Build Tools 34.0.0
✅ Gradle 8.2
✅ Node.js 18+
✅ 4GB+ free disk space
```

### **Step 1: Install Dependencies**
```bash
cd /root/FriendOverlay/app
npm install
```

### **Step 2: Setup Android Environment**
```bash
# Check if Android SDK is installed
echo $ANDROID_HOME

# If not set, find it:
# Common locations:
# - /usr/lib/android-sdk
# - ~/Android/Sdk
# - /opt/android-sdk

export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### **Step 3: Navigate to Android Folder**
```bash
cd android
```

### **Step 4: Clean Build**
```bash
./gradlew clean
```

### **Step 5: Build Debug APK**
```bash
./gradlew assembleDebug
```

### **Step 6: Find APK**
```bash
# APK will be at:
app/build/outputs/apk/debug/app-debug.apk

# Copy to project root
cp app/build/outputs/apk/debug/app-debug.apk /root/FriendOverlay/FriendOverlay.apk
```

### **Step 7: Install on Device**
```bash
# Connect Android device via USB
# Enable USB debugging in Developer Options

adb install /root/FriendOverlay/FriendOverlay.apk
```

---

## 🚀 **QUICKER ALTERNATIVE: Development Mode**

### **For Testing Without APK:**

```bash
# Terminal 1 - Start Metro Bundler
cd /root/FriendOverlay/app
npm install
npx react-native start

# Terminal 2 - Run on Device
npx react-native run-android
```

This will:
1. Build and install automatically
2. Enable hot reloading
3. Show errors in real-time
4. Much faster for development!

---

## 📦 **RELEASE APK (For Production)**

### **Step 1: Generate Keystore**
```bash
keytool -genkey -v -keystore friendoverlay.keystore -alias friendoverlay -keyalg RSA -keysize 2048 -validity 10000
```

### **Step 2: Configure Signing**
Edit `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('friendoverlay.keystore')
            storePassword 'your-password'
            keyAlias 'friendoverlay'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### **Step 3: Build Release APK**
```bash
cd android
./gradlew assembleRelease
```

### **Step 4: Find Release APK**
```
app/build/outputs/apk/release/app-release.apk
```

---

## ⚡ **FASTEST METHOD: Use Existing RN Project**

If you don't want to set up Android SDK:

### **Option A: Expo (Easiest)**
```bash
# Convert to Expo project
npx create-expo-app FriendOverlayExpo
# Copy all screen files
# Build via Expo: eas build --platform android
```

### **Option B: Online Build Service**
1. Upload code to GitHub
2. Use services like:
   - Expo Application Services (EAS)
   - App Center
   - Bitrise
3. They build APK for you!

---

## 📊 **CURRENT STATUS**

### **What's Ready:**
```
✅ All JavaScript code
✅ All Kotlin code
✅ Supabase backend
✅ All screen components
✅ Navigation setup
```

### **What's Needed for APK:**
```
⚠️ React Native project initialization
⚠️ Android SDK setup
⚠️ Gradle build
⚠️ Dependencies installation
```

---

## 🎯 **RECOMMENDED FOR YOU:**

### **For Quick Testing (NOW):**
```bash
cd /root/FriendOverlay/app

# Create minimal React Native project
npx @react-native-community/cli init FriendOverlayApp

# Copy all our files:
cp ../App.js FriendOverlayApp/
cp -r ../screens FriendOverlayApp/
cp -r ../modules FriendOverlayApp/
cp -r ../utils FriendOverlayApp/
cp ../supabase.js FriendOverlayApp/
cp ../package.json FriendOverlayApp/

# Install and run
cd FriendOverlayApp
npm install
npx react-native run-android
```

### **For Production APK (Later):**
1. Set up Android SDK properly
2. Follow "Release APK" steps above
3. Or use online build service

---

## 🚀 **QUICK START COMMAND:**

```bash
# This will build and install in one command:
cd /root/FriendOverlay/app
npm install
npx react-native run-android
```

This creates a debug build automatically and installs it on your connected device!

---

## 📝 **APK Location After Build:**

```
/root/FriendOverlay/app/android/app/build/outputs/apk/debug/app-debug.apk
```

File size: ~50-80 MB (includes React Native runtime)

---

**For immediate testing, use:** `npx react-native run-android`  
**For production APK, follow release build steps above!**
