# Voice Communication Implementation Plan

## Overview
This plan outlines the implementation of a seamless, app-wide voice communication system that allows users to interact with the Primer app through voice. The system will stream audio to and from the API at https://primer.calemcnulty.com/api/voice, with minimal lag using WebRTC.

## Technical Requirements
1. Real-time voice streaming with WebRTC
2. Minimal UI with just animated ellipses indicator
3. Redux integration for state management
4. App-wide voice capability (not limited to specific screens)
5. Low-latency audio processing

## Architecture

### 1. Core Components

#### 1.1 VoiceService
A singleton service that handles:
- WebRTC connection setup and management
- Audio recording and streaming
- Processing incoming audio
- Connection state management

#### 1.2 VoiceContext (React Context)
Provides app-wide access to:
- Voice service instance
- Voice state (listening, speaking, idle)
- Methods to start/stop voice interactions

#### 1.3 VoiceIndicator Component
A minimal UI component showing:
- Animated ellipses during active communication
- Optional status indicators
- Positioned in the corner of all screens

#### 1.4 Redux Integration
- New voiceSlice for state management
- Thunks for async operations
- Selectors for accessing voice states

### 2. Data Flow

```
User Speech → Device Microphone → WebRTC → API → TTS Processing → Audio Response → Device Speaker
```

### 3. WebRTC Implementation

#### 3.1 Connection Setup
```typescript
// Establish WebRTC connection with the voice API
const configuration: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};
const peerConnection = new RTCPeerConnection(configuration);
```

#### 3.2 Media Handling
```typescript
// Access microphone and create stream
const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
mediaStream.getTracks().forEach(track => peerConnection.addTrack(track, mediaStream));
```

## Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Setup Dependencies
- Install required packages:
  - `react-native-webrtc`
  - Additional Expo configuration for native modules

#### 1.2 Voice Service Implementation
- Create `VoiceService` class
- Implement WebRTC connection handling
- Setup audio capture functionality
- Create basic audio stream processing

#### 1.3 Redux Integration
- Create `voiceSlice.ts`
- Define state interface and initial state
- Implement reducers and action creators
- Create async thunks for voice operations

### Phase 2: Core Functionality (Week 2)

#### 2.1 API Integration
- Implement connection to `https://primer.calemcnulty.com/api/voice`
- Setup WebRTC signaling protocol
- Add authentication and session handling
- Implement error handling and reconnection logic

#### 2.2 Audio Processing
- Configure audio for optimal quality and low latency
- Implement noise cancellation
- Add voice activity detection
- Setup audio output handling

#### 2.3 VoiceContext Creation
- Implement React Context for app-wide access
- Create provider component
- Connect to Redux store
- Add utility hooks for components

### Phase 3: UI and Integration (Week 3)

#### 3.1 VoiceIndicator Component
- Create minimal UI component
- Implement animated ellipses
- Position in app corner
- Add state-based styling

#### 3.2 App-wide Integration
- Modify app root layout for voice capability
- Update permission handling
- Ensure background audio processing
- Test across different screens and navigation states

#### 3.3 Performance Optimization
- Optimize WebRTC connection parameters
- Reduce audio latency
- Minimize battery impact
- Handle interruptions (calls, etc.)

## Technical Details

### Voice Service Class Structure

```typescript
class VoiceService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private isConnected: boolean = false;
  private isListening: boolean = false;
  
  // Event callbacks
  private onStateChangeCallbacks: ((state: VoiceState) => void)[] = [];
  
  constructor() {
    // Initialize WebRTC
  }
  
  async initialize(): Promise<void> {
    // Setup WebRTC and request permissions
  }
  
  async startListening(): Promise<void> {
    // Start recording and streaming audio
  }
  
  async stopListening(): Promise<void> {
    // Stop recording
  }
  
  private setupPeerConnection(): void {
    // Configure WebRTC peer connection
  }
  
  private handleIncomingAudio(stream: MediaStream): void {
    // Process and play incoming audio
  }
  
  subscribe(callback: (state: VoiceState) => void): () => void {
    // Add callback for state changes and return unsubscribe function
  }
}
```

### Redux Voice Slice

```typescript
interface VoiceState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  recentInteractions: VoiceInteraction[];
}

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    // Synchronous actions
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    // Other reducers
  },
  extraReducers: (builder) => {
    // Async action handling
  }
});
```

### Voice API Communication Protocol

The WebRTC signaling will use a secure WebSocket connection to:
1. Exchange ICE candidates
2. Negotiate media parameters
3. Handle session establishment
4. Manage audio channel configuration

## Testing Strategy

1. **Unit Tests**
   - Test individual components of the voice service
   - Verify Redux actions and reducers
   - Mock WebRTC connections

2. **Integration Tests**
   - Test voice service with mock API
   - Verify Redux integration
   - Test context provider functionality

3. **End-to-End Tests**
   - Test with actual API endpoint
   - Measure latency and quality
   - Verify cross-screen functionality

## Fallback and Error Handling

1. Implement graceful degradation when WebRTC is unavailable
2. Add reconnection logic for dropped connections
3. Provide user feedback for connection issues
4. Cache voice commands for offline replay when connection is restored

## Security Considerations

1. Encrypt all WebRTC traffic
2. Implement proper authentication
3. Handle sensitive audio data appropriately
4. Comply with privacy regulations for voice data

## Next Steps

1. Begin implementation of VoiceService
2. Create Redux slice for voice state
3. Design and implement minimal UI component
4. Integrate with existing app navigation 