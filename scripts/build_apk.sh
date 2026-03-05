#!/bin/bash

# ============================================
# FriendOverlay - APK Build Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "🚀 FriendOverlay - APK Builder"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project
cd /root/FriendOverlay/app

# ============================================
# Step 1: Check if node_modules exists
# ============================================
echo -e "${YELLOW}[1/6]${NC} Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# ============================================
# Step 2: Create Android directory structure
# ============================================
echo ""
echo -e "${YELLOW}[2/6]${NC} Setting up Android structure..."

mkdir -p android/app/src/main/java/com/friendoverlay
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
mkdir -p android/app/src/main/res/values
mkdir -p android/gradle/wrapper

# ============================================
# Step 3: Create Android Build Files
# ============================================
echo ""
echo -e "${YELLOW}[3/6]${NC} Creating Android build files..."

# Create android/build.gradle
cat > android/build.gradle << 'EOF'
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.2.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}

apply plugin: "com.facebook.react.rootproject"
EOF

# Create android/app/build.gradle
cat > android/app/build.gradle << 'EOF'
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

react {
    autolinkLibrariesWithApp()
}

android {
    namespace "com.friendoverlay"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.friendoverlay"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        debug {
            debuggable true
        }
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation "com.facebook.react:react-android"
    implementation "com.facebook.react:hermes-android"
}
EOF

# Create android/settings.gradle
cat > android/settings.gradle << 'EOF'
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    includeBuild("../node_modules/@react-native/gradle-plugin")
}

plugins {
    id("com.facebook.react.settings")
}

extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
    ex.autolinkLibrariesFromCommand()
}

rootProject.name = 'FriendOverlay'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')
EOF

# Create android/gradle.properties
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=false
EOF

echo "✅ Android build files created"

# ============================================
# Step 4: Download Gradle Wrapper
# ============================================
echo ""
echo -e "${YELLOW}[4/6]${NC} Setting up Gradle wrapper..."

if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "Downloading Gradle wrapper..."
    cd android
    gradle wrapper --gradle-version 8.2
    cd ..
else
    echo "✅ Gradle wrapper already exists"
fi

# ============================================
# Step 5: Build APK
# ============================================
echo ""
echo -e "${YELLOW}[5/6]${NC} Building APK..."

cd android

echo "Running Gradle build..."
chmod +x gradlew
./gradlew assembleDebug

# Find the APK
APK_PATH=$(find build/outputs/apk/debug -name "*.apk" -type f | head -1)

if [ -n "$APK_PATH" ]; then
    echo ""
    echo -e "${GREEN}============================================"
    echo "✅ APK BUILD SUCCESSFUL!"
    echo "============================================${NC}"
    echo ""
    echo "APK Location: $APK_PATH"
    echo ""
    echo "To install on device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "To install on specific device:"
    echo "  adb -s <device_id> install $APK_PATH"
else
    echo -e "${RED}❌ APK build failed!${NC}"
    exit 1
fi

cd ..

# ============================================
# Step 6: Copy APK to project root
# ============================================
echo ""
echo -e "${YELLOW}[6/6]${NC} Copying APK to project root..."

cp "$APK_PATH" /root/FriendOverlay/FriendOverlay-v1.0.0-debug.apk

echo ""
echo -e "${GREEN}============================================"
echo "🎉 BUILD COMPLETE!"
echo "============================================${NC}"
echo ""
echo "APK saved to: /root/FriendOverlay/FriendOverlay-v1.0.0-debug.apk"
echo ""
echo "File size: $(ls -lh /root/FriendOverlay/FriendOverlay-v1.0.0-debug.apk | awk '{print $5}')"
echo ""
echo "To install:"
echo "  1. Transfer APK to Android device"
echo "  2. Enable 'Install from Unknown Sources'"
echo "  3. Tap APK file to install"
echo "  4. Open FriendOverlay app"
echo ""
echo "Or use ADB:"
echo "  adb install /root/FriendOverlay/FriendOverlay-v1.0.0-debug.apk"
echo ""
