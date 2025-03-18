import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { 
  fetchConversation, 
  sendMessage, 
  startNewConversation, 
  setListening, 
  addLocalMessage 
} from '@/store/slices/rtviSlice';
import { RtviMessage } from '@/services/api';
import { IconSymbol } from '@/components/ui/IconSymbol';

export function RtviChat() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { conversation, isLoading, error, isListening } = useAppSelector((state) => state.rtvi);
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load conversation on initial render with platform-specific timing
  useEffect(() => {
    // On Android, add a delay before fetching to avoid startup crashes
    if (Platform.OS === 'android') {
      const timer = setTimeout(() => {
        dispatch(fetchConversation());
        setIsInitialized(true);
      }, 1000); // 1 second delay on Android
      
      return () => clearTimeout(timer);
    } else {
      // On iOS, fetch immediately
      dispatch(fetchConversation());
      setIsInitialized(true);
    }
  }, [dispatch]);
  
  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    
    // Add a temporary message to show immediately while the API call is in progress
    dispatch(addLocalMessage({
      content: message,
      timestamp: new Date().toISOString(),
      fromUser: true
    }));
    
    const trimmedMessage = message.trim();
    setMessage('');
    
    // Send actual message to the API
    dispatch(sendMessage(trimmedMessage));
  };
  
  // Handle starting a new conversation
  const handleNewConversation = () => {
    dispatch(startNewConversation());
  };
  
  // Toggle listening mode
  const toggleListening = () => {
    dispatch(setListening(!isListening));
    // In a real app, this would integrate with voice recognition
    // For now, we'll just simulate the UI changes
  };
  
  // Render a chat message
  const renderMessage = ({ item }: { item: RtviMessage }) => {
    const isUser = item.fromUser;
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}>
        <ThemedView 
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
            { backgroundColor: isUser ? colors.primary : colors.card }
          ]}
        >
          <ThemedText 
            style={[
              styles.messageText,
              isUser && { color: '#FFFFFF' }
            ]}
          >
            {item.content}
          </ThemedText>
        </ThemedView>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>RTVI</ThemedText>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={handleNewConversation}
          >
            <ThemedText style={styles.newChatButtonText}>New Chat</ThemedText>
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchConversation())}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          data={conversation}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <IconSymbol
                size={60}
                color={colors.text}
                name="waveform"
                style={styles.emptyIcon}
              />
              <ThemedText style={styles.emptyText}>
                Start a conversation with your Primer
              </ThemedText>
            </View>
          )}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Ask your Primer something..."
            placeholderTextColor={colors.textDim}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            editable={!isLoading}
          />
          
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isListening && { backgroundColor: colors.primary }
            ]}
            onPress={toggleListening}
            disabled={isLoading}
          >
            <IconSymbol
              size={24}
              color={isListening ? '#FFFFFF' : colors.text}
              name="mic.fill"
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleSendMessage}
            disabled={isLoading || message.trim() === ''}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol
                size={24}
                color="#FFFFFF"
                name="arrow.up"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  newChatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#B91C1C',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});