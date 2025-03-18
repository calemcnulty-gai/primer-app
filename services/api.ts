import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import * as Application from 'expo-application';

// API base URL from Expo constants
// For iOS simulator, localhost on the Mac is available as localhost:3000
// For Android emulator, use 10.0.2.2:3000 to access host's localhost
const getDevApiUrl = () => {
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else {
    return 'http://localhost:3000';
  }
};

const API_URL = Constants.expoConfig?.extra?.apiUrl || getDevApiUrl();

// Add retry logic for network operations (especially important for Android)
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries <= 1) throw error;
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with one less retry remaining
    return fetchWithRetry(url, options, retries - 1, delay * 1.5);
  }
};

// Get device ID for API requests
const getDeviceId = async (): Promise<string> => {
  let deviceId = '';

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
      console.log(`API Request: ${API_URL}${endpoint}`, {
        method: mergedOptions.method || 'GET',
        headers: mergedOptions.headers,
        body: mergedOptions.body ? JSON.parse(mergedOptions.body as string) : undefined
      });
    }

    // Use fetchWithRetry instead of fetch for better reliability on Android
    const response = await fetchWithRetry(`${API_URL}${endpoint}`, mergedOptions);
    
    // Log raw response in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      console.log(`API Raw Response: ${API_URL}${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      });
    }
    
    // Check for non-JSON responses or HTML error pages
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      console.error(`Received non-JSON response with content type: ${contentType}`);
      throw new Error(`Unexpected response type: ${contentType}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Log parsed response in development
    if (Constants.expoConfig?.extra?.environment === 'development') {
      console.log(`API Response Data: ${API_URL}${endpoint}`, data);
    }
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data as T;
  } catch (error) {
    console.error('API request error:', error);
    
    // Add more detailed info to help debug connection issues
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      console.error(`Network request failed to ${API_URL}${endpoint}. Make sure your API server is running at ${API_URL}.`);
    }
    
    // Platform-specific error handling
    if (Platform.OS === 'android') {
      // On Android, some network errors might happen during initial startup
      // Return a graceful fallback instead of crashing
      if (endpoint.includes('/rtvi/conversation')) {
        console.log('Returning empty conversation for Android due to network error');
        return { 
          success: true, 
          conversation: [],
          message: {
            id: 'system-message',
            content: 'Connection temporarily unavailable. Please try again.',
            timestamp: new Date().toISOString(),
            fromUser: false
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
        }
      }
      Alert.alert('API Error', errorMessage);
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