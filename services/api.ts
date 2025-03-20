import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import * as Application from 'expo-application';

// We need to handle special cases for the --localhost flag
// When using this flag, Expo Dev Server replaces 'localhost' with the actual LAN IP
// of your machine (e.g. 192.168.1.x or 10.10.1.x)
const getDevApiUrl = () => {
  // For development mode, use environment-specific URL
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost directly
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    try {
      // Check for explicit API_URL in Constants first
      if (Constants.expoConfig?.extra?.androidApiUrl) {
        const url = Constants.expoConfig.extra.androidApiUrl;
        console.log('[API] Using Android API URL from config:', url);
        return url;
      }
      
      // When using --localhost flag with Android, Expo automatically 
      // replaces localhost in URLs with your machine's actual LAN IP address
      // So we can safely use localhost here
      console.log('[API] Using localhost for Android with --localhost flag');
      return 'http://localhost:3000';
    } catch (error) {
      console.error('[API] Error getting Android API URL:', error);
      console.log('[API] Using fallback Android API URL: http://localhost:3000');
      return 'http://localhost:3000';
    }
  } else {
    // Web platform
    return 'http://localhost:3000';
  }
};

// Get API URL with enhanced logging
const getApiUrl = () => {
  // In production, use the configured API URL
  if (Constants.expoConfig?.extra?.environment === 'production') {
    const prodUrl = Constants.expoConfig?.extra?.apiUrl || '';
    console.log(`[API] Using production API URL: ${prodUrl}`);
    return prodUrl;
  }
  
  // In development, get the appropriate dev URL
  const devUrl = getDevApiUrl();
  console.log(`[API] Using development API URL: ${devUrl} on ${Platform.OS}`);
  return devUrl;
};

const API_URL = getApiUrl();

// Add retry logic for network operations (especially important for Android)
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 5, delay = 500): Promise<Response> => {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[API] Fetch attempt ${attempt + 1}/${retries} for ${url}`);
      const response = await fetch(url, options);
      console.log(`[API] Fetch successful on attempt ${attempt + 1}`);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`[API] Fetch attempt ${attempt + 1} failed:`, error);
      
      if (attempt === retries - 1) {
        console.error(`[API] All ${retries} retry attempts failed for ${url}`);
        break;
      }
      
      const waitTime = delay * Math.pow(1.5, attempt);
      console.log(`[API] Waiting ${waitTime}ms before retry ${attempt + 2}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// Get device ID for API requests
const getDeviceId = async (): Promise<string> => {
  let deviceId = '';

  try {
    if (Platform.OS === 'ios') {
      deviceId = await Application.getIosIdForVendorAsync() || '';
    } else if (Platform.OS === 'android') {
      deviceId = await Application.getAndroidId() || '';
    } else {
      // Web platform - generate a consistent ID and store in localStorage
      const storedId = localStorage.getItem('deviceId');
      if (storedId) {
        deviceId = storedId;
      } else {
        deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('deviceId', deviceId);
      }
    }
  } catch (error) {
    console.error('[API] Error getting device ID:', error);
    deviceId = `fallback-${Platform.OS}-${Date.now()}`;
  }

  console.log(`[API] Using device ID: ${deviceId.substring(0, 8)}...`);
  return deviceId;
};

// Generic fetch function with error handling
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const deviceId = await getDeviceId();
    
    // Merge default headers with provided options
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
        ...options.headers,
      },
    };

    // Log request in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      console.log(`[API] Request: ${API_URL}${endpoint}`, {
        method: mergedOptions.method || 'GET',
        headers: mergedOptions.headers,
        body: mergedOptions.body ? JSON.parse(mergedOptions.body as string) : undefined
      });
    }

    // Use fetchWithRetry instead of fetch for better reliability on Android
    const response = await fetchWithRetry(`${API_URL}${endpoint}`, mergedOptions);
    
    // Log raw response in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      console.log(`[API] Raw Response: ${API_URL}${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
    }
    
    // Check for non-JSON responses or HTML error pages
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error(`[API] Received non-JSON response with content type: ${contentType}`);
      throw new Error(`Unexpected response type: ${contentType}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Log parsed response in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      console.log(`[API] Response Data: ${API_URL}${endpoint}`, data);
    }
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data as T;
  } catch (error) {
    console.error('[API] Request error:', error);
    
    // Add more detailed info to help debug connection issues
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error(`[API] Network request failed to ${API_URL}${endpoint}. Make sure your API server is running at ${API_URL}.`);
      
      // Additional helpful message for --localhost specific issues
      if (API_URL.includes('localhost')) {
        console.error(`
[API] When using --localhost flag:
1. Ensure your API server is running and bound to 0.0.0.0 (all interfaces), not just 127.0.0.1
2. Check that your computer's firewall allows incoming connections on port 3000
3. Verify that both your device and computer are on the same network
4. Your actual API URL on the device will be something like http://YOUR_COMPUTER_IP:3000`);
      }
    }
    
    // Platform-specific error handling
    if (Platform.OS === 'android') {
      // On Android, provide a graceful fallback for network errors
      if (endpoint.includes('/rtvi/conversation')) {
        console.log('[API] Returning empty conversation for Android due to network error');
        return { 
          success: true, 
          conversation: [],
          message: {
            id: 'system-message',
            content: 'Connection temporarily unavailable. Please try again when your network connection improves.',
            timestamp: new Date().toISOString(),
            fromUser: false
          }
        } as unknown as T;
      } else if (endpoint.includes('/story/current')) {
        console.log('[API] Returning fallback story segment for Android due to network error');
        return {
          success: true,
          segment: {
            id: 'fallback-segment',
            content: 'Unable to connect to the story server. Please check your internet connection and try again.',
            choices: [{ id: 'retry', text: 'Retry Connection' }]
          },
          state: {
            userId: deviceId || 'unknown',
            currentSegmentId: 'fallback-segment',
            progress: 0,
            contextualData: {},
            readSegments: [],
            isConversationalMode: false,
            recentConversation: []
          }
        } as unknown as T;
      }
    }
    
    // Show alert with error message in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('Network request failed')) {
          errorMessage += `\n\nMake sure your API server is running at ${API_URL}`;
          
          if (API_URL.includes('localhost')) {
            errorMessage += `\n\nWith --localhost flag, your API server must be bound to 0.0.0.0:3000, not just localhost:3000`;
          }
        }
      }
      Alert.alert('[API] Error', errorMessage);
    }
    
    throw error;
  }
};

// Types for Story API responses
export interface StorySegment {
  segmentId: string;
  title: string;
  content: string;
  choices: StoryChoice[];
}

export interface StoryChoice {
  choiceId: string;
  text: string;
}

// New API response interfaces to match the server's format
export interface ApiSegment {
  id: string;
  content: string;
  choices: Array<{id: string; text: string}>;
}

export interface ApiStoryResponse {
  success: boolean;
  segment: ApiSegment;
  state: {
    userId: string;
    currentSegmentId: string;
    progress: number;
    contextualData: any;
    readSegments: string[];
    isConversationalMode: boolean;
    recentConversation: any[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// RTVI (Real-Time Voice Interaction) interfaces
export interface RtviMessage {
  id: string;
  content: string;
  timestamp: string;
  fromUser: boolean;
}

export interface RtviResponse {
  success: boolean;
  message: RtviMessage;
  conversation: RtviMessage[];
}

// API methods
export const api = {
  
  // Story related endpoints
  story: {
    // Get current story segment
    getCurrentSegment: async () => {
      return apiFetch<ApiStoryResponse>('/api/v1/story/current');
    },
    
    // Make a choice to progress the story
    makeChoice: async (choiceId: string) => {
      return apiFetch<ApiStoryResponse>('/api/v1/story/choice', {
        method: 'POST',
        body: JSON.stringify({ choiceId }),
      });
    },
    
    // Reset the story to the beginning
    resetStory: async () => {
      return apiFetch<ApiStoryResponse>('/api/v1/story/reset', {
        method: 'POST',
      });
    },
  },
  
  // User related endpoints (even though we don't have auth, we track device)
  user: {
    // Get or create user profile based on device ID
    getProfile: async () => {
      return apiFetch<{id: string; settings: any}>('/api/v1/user/profile');
    },
    
    // Update user settings
    updateSettings: async (settings: any) => {
      return apiFetch<{success: boolean}>('/api/v1/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
  },
  
  // RTVI (Real-Time Voice Interaction) endpoints
  rtvi: {
    // Get conversation history
    getConversation: async () => {
      return apiFetch<RtviResponse>('/api/v1/rtvi/conversation');
    },
    
    // Send a message to RTVI
    sendMessage: async (message: string) => {
      return apiFetch<RtviResponse>('/api/v1/rtvi/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    
    // Start a new RTVI conversation
    startNewConversation: async () => {
      return apiFetch<RtviResponse>('/api/v1/rtvi/new', {
        method: 'POST',
      });
    },
  },
};

export default api; 