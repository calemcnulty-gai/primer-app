import {
  RTCPeerConnection,
  MediaStream,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import Constants from 'expo-constants';

export type VoiceState = {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
};

export type VoiceStateChangeCallback = (state: VoiceState) => void;

class VoiceService {
  private static instance: VoiceService;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private websocket: WebSocket | null = null;
  
  private _state: VoiceState = {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null,
  };
  
  // Event callbacks
  private onStateChangeCallbacks: VoiceStateChangeCallback[] = [];
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }
  
  get state(): VoiceState {
    return { ...this._state };
  }
  
  private setState(newState: Partial<VoiceState>) {
    this._state = { ...this._state, ...newState };
    this.notifyStateChange();
  }
  
  private notifyStateChange() {
    this.onStateChangeCallbacks.forEach(callback => callback(this._state));
  }
  
  public subscribe(callback: VoiceStateChangeCallback): () => void {
    this.onStateChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public async initialize(): Promise<void> {
    try {
      await this.setupWebRTC();
      await this.connectToSignalingServer();
      this.setState({ isConnected: true, error: null });
    } catch (error) {
      this.setState({ error: error instanceof Error ? error.message : 'Failed to initialize voice service' });
      throw error;
    }
  }
  
  private async setupWebRTC(): Promise<void> {
    // Setup WebRTC peer connection
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    
    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON()
        }));
      }
    };
    
    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.handleIncomingAudio(this.remoteStream);
    };
    
    // Request audio permissions and set up local stream
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      this.localStream = stream;
      
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
    } catch (error) {
      throw new Error('Failed to access microphone');
    }
  }
  
  private connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get the voice API URL from app config
      const voiceApiUrl = Constants.expoConfig?.extra?.voiceApiUrl || 'wss://primer.calemcnulty.com/api/v1/voice';
      
      this.websocket = new WebSocket(voiceApiUrl);
      
      this.websocket.onopen = async () => {
        // Initiate the WebRTC connection by creating and sending an offer
        try {
          await this.createAndSendOffer();
          resolve();
        } catch (error) {
          reject(new Error('Failed to create and send offer'));
        }
      };
      
      this.websocket.onerror = (error) => {
        reject(new Error('Failed to connect to signaling server'));
      };
      
      this.websocket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'offer':
            await this.handleOffer(message);
            break;
          case 'answer':
            await this.handleAnswer(message);
            break;
          case 'ice-candidate':
            await this.handleIceCandidate(message);
            break;
          case 'speaking-start':
            this.setState({ isSpeaking: true });
            break;
          case 'speaking-end':
            this.setState({ isSpeaking: false });
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      };
      
      this.websocket.onclose = () => {
        this.setState({ isConnected: false });
      };
    });
  }
  
  // New method to create and send offer
  private async createAndSendOffer(): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    try {
      // Create offer
      const offer = await this.peerConnection.createOffer();
      // Set local description
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer to server
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({
          type: 'offer',
          sdp: this.peerConnection.localDescription
        }));
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }
  
  private async handleOffer(message: any): Promise<void> {
    if (!this.peerConnection) return;
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'answer',
        sdp: this.peerConnection.localDescription
      }));
    }
  }
  
  private async handleAnswer(message: any): Promise<void> {
    if (!this.peerConnection) return;
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
      // Connection is fully established at this point
      this.setState({ isConnected: true });
    } catch (error) {
      console.error('Error setting remote description:', error);
      this.setState({ error: 'Failed to establish connection' });
    }
  }
  
  private async handleIceCandidate(message: any): Promise<void> {
    if (!this.peerConnection) return;
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    } catch (error) {
      console.error('Error adding ice candidate:', error);
    }
  }
  
  private handleIncomingAudio(stream: MediaStream): void {
    // Process incoming audio stream
    // In a real implementation, this would play the audio
    this.setState({ isSpeaking: true });
    
    // Example: detect when the audio stream ends
    stream.getAudioTracks()[0].onended = () => {
      this.setState({ isSpeaking: false });
    };
  }
  
  public async startListening(): Promise<void> {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: 'start-listening' }));
      this.setState({ isListening: true });
    } else {
      throw new Error('WebSocket connection not established');
    }
  }
  
  public async stopListening(): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: 'stop-listening' }));
      this.setState({ isListening: false });
    }
  }
  
  private isInitialized(): boolean {
    return !!this.peerConnection && !!this.localStream && !!this.websocket;
  }
  
  public async disconnect(): Promise<void> {
    this.stopListening();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.setState({
      isConnected: false,
      isListening: false,
      isSpeaking: false
    });
  }
}

export default VoiceService;