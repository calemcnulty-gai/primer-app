const isProd = process.env.APP_ENV === 'production';

// Always use production URLs
const API_URL = 'https://primer.calemcnulty.com';

// Voice API URLs
const VOICE_API_URL = 'wss://primer.calemcnulty.com/api/v1/voice';

module.exports = {
  expo: {
    name: "The Primer",
    slug: "primer-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    backgroundColor: "#f8f3e8",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#f8f3e8"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "com.calemcnulty.primerapp",
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: "This app uses the microphone for voice interaction with your Primer.",
        NSCameraUsageDescription: "This app uses the camera for WebRTC communication."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#f8f3e8"
      },
      permissions: [
        "RECORD_AUDIO", 
        "INTERNET",
        "CAMERA",
        "MODIFY_AUDIO_SETTINGS"
      ],
      config: {
        cleartextTraffic: true
      },
      package: "com.calemcnulty.primerapp"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice interaction."
        }
      ],
      "@config-plugins/react-native-webrtc"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: API_URL,
      androidApiUrl: API_URL,
      environment: isProd ? "production" : "development",
      // Voice API configuration
      voiceApiUrl: VOICE_API_URL
    },
    updates: {
      enabled: false,
      checkAutomatically: "ON_ERROR_RECOVERY",
      fallbackToCacheTimeout: 0,
      url: ""
    }
  }
}; 