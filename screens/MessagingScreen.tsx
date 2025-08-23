import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';

interface MessagingScreenProps {
  onNavigateToDashboard: () => void;
}

export default function MessagingScreen({ onNavigateToDashboard }: MessagingScreenProps) {
  const mockConversations = [
    {
      id: '1',
      clientName: 'John Smith',
      lastMessage: 'Thanks for the great service!',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      lastMessage: 'When can you come by?',
      time: '1 day ago',
      unread: false,
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      lastMessage: 'The car is running perfectly now',
      time: '3 days ago',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToDashboard} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockConversations.map((conversation) => (
          <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
            <View style={styles.conversationHeader}>
              <Text style={styles.clientName}>{conversation.clientName}</Text>
              <Text style={styles.messageTime}>{conversation.time}</Text>
            </View>
            <View style={styles.messageContainer}>
              <Text style={[
                styles.lastMessage,
                conversation.unread && styles.unreadMessage
              ]}>
                {conversation.lastMessage}
              </Text>
              {conversation.unread && (
                <View style={styles.unreadBadge}>
                  <Ionicons name="notifications" size={12} color={colors.textWhite} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No more messages
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Your conversations with clients will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  header: {
    backgroundColor: colors.bgPrimary,
    paddingTop: 50,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.primaryBlue,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  conversationCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clientName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  messageTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  unreadBadge: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.textMedium,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: fontSize.base,
    color: colors.textLight,
  },
});
