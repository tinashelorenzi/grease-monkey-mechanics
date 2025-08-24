import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';

interface Message {
  id: string;
  text: string;
  sender: 'mechanic' | 'customer';
  timestamp: number;
}

interface FloatingMessageBoxProps {
  isVisible: boolean;
  onClose: () => void;
  customerName: string;
  onSendMessage: (message: string) => void;
  messages: Message[];
}

export default function FloatingMessageBox({
  isVisible,
  onClose,
  customerName,
  onSendMessage,
  messages,
}: FloatingMessageBoxProps) {
  console.log('🎯 FloatingMessageBox render - isVisible:', isVisible, 'customerName:', customerName);
  const [messageText, setMessageText] = useState('');
  const slideAnim = React.useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 400,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isVisible]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const formatTime = (timestamp: any) => {
    try {
      // Handle Firebase Timestamp
      if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle regular timestamp
      if (timestamp && typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle timestamp with seconds
      if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return '--:--';
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return '--:--';
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Ionicons name="chatbubble" size={20} color={colors.primaryBlue} />
            <Text style={styles.headerTitle}>Chat with {customerName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>Start the conversation</Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === 'mechanic' ? styles.myMessage : styles.theirMessage
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.sender === 'mechanic' ? styles.myBubble : styles.theirBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === 'mechanic' ? styles.myMessageText : styles.theirMessageText
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      message.sender === 'mechanic' ? styles.myMessageTime : styles.theirMessageTime
                    ]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={messageText.trim() ? colors.textWhite : colors.textLight} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    height: '80%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.sm,
  },
  closeButton: {
    padding: spacing.sm,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.textMedium,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: fontSize.base,
    color: colors.textLight,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myBubble: {
    backgroundColor: colors.primaryBlue,
    borderBottomRightRadius: borderRadius.sm,
  },
  theirBubble: {
    backgroundColor: colors.bgSecondary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageText: {
    fontSize: fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  myMessageText: {
    color: colors.textWhite,
  },
  theirMessageText: {
    color: colors.textDark,
  },
  messageTime: {
    fontSize: fontSize.xs,
  },
  myMessageTime: {
    color: colors.textWhite,
    opacity: 0.8,
  },
  theirMessageTime: {
    color: colors.textLight,
  },
  inputContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    fontSize: fontSize.base,
    color: colors.textDark,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primaryBlue,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
});
