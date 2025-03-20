const isProd = process.env.APP_ENV === 'production';

// For Android with the --localhost flag, we use a consistent approach
// The Expo Dev server will automatically replace 'localhost' with your
// machine's IP address (like 192.168.x.x) when sending to the device
const DEV_API_URL = 'http://localhost:3000';
const PROD_API_URL = 'https://primer.calemcnulty.com';

// PipeCat API URLs
const PIPECAT_DEV_API_URL = 'http://localhost:8000';
const PIPECAT_PROD_API_URL = 'https://api.pipecat.ai';

// Get the PipeCat API key from environment or use a placeholder
const PIPECAT_API_KEY = process.env.PIPECAT_API_KEY || '';

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
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: isProd ? PROD_API_URL : DEV_API_URL,
      androidApiUrl: isProd ? PROD_API_URL : DEV_API_URL,
      environment: isProd ? "production" : "development",
      // Add a comment to remind about --localhost behavior
      apiNote: "When using --localhost flag, 'localhost' is automatically replaced with the host machine's IP",
      // PipeCat API configuration
      pipecatApiUrl: isProd ? PIPECAT_PROD_API_URL : PIPECAT_DEV_API_URL,
      pipecatApiKey: PIPECAT_API_KEY
    },
    updates: {
      enabled: false,
      checkAutomatically: "ON_ERROR_RECOVERY",
      fallbackToCacheTimeout: 0,
      url: ""
    }
  }
}; 