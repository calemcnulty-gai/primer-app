const isProd = process.env.APP_ENV === 'production';

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
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#f8f3e8"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: "This app uses the microphone for voice interaction with your Primer."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#f8f3e8"
      },
      permissions: ["RECORD_AUDIO", "INTERNET"],
      config: {
        disableOtaUpdates: true,
        cleartextTraffic: true  // Always allow cleartext while debugging
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
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: isProd ? "https://primer.calemcnulty.com" : "",
      environment: isProd ? "production" : "development"
    },
    updates: {
      enabled: false,
      checkAutomatically: "ON_ERROR_RECOVERY"
    }
  }
}; 