import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';
import { ServiceRequest } from '../services/requestService';
import requestService from '../services/requestService';
import messagingService, { Message } from '../services/messagingService';
import FloatingMessageBox from '../components/FloatingMessageBox';
import JobSuccessScreen from './JobSuccessScreen';
import { useAuth } from '../contexts/AuthContext';

interface ActiveJobScreenProps {
  request: ServiceRequest;
  onComplete: () => void;
  onNavigateToDashboard: () => void;
  onOpenMessaging: () => void;
}

export default function ActiveJobScreen({
  request,
  onComplete,
  onNavigateToDashboard,
  onOpenMessaging,
}: ActiveJobScreenProps) {
  const { user, mechanicProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [hasQuote, setHasQuote] = useState(request.status === 'quoted' || request.quoteAmount);
  const [currentQuoteAmount, setCurrentQuoteAmount] = useState(request.quoteAmount || 0);
  const [currentQuoteDescription, setCurrentQuoteDescription] = useState(request.quoteDescription || '');
  const [showMessaging, setShowMessaging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleComplete = async () => {
    console.log('🔍 handleComplete called');
    console.log('🔍 User UID:', user?.uid);
    console.log('🔍 Request ID:', request.id);
    console.log('🔍 Has Quote:', hasQuote);
    
    if (!user?.uid) {
      console.log('❌ No user UID found');
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    
    console.log('✅ User authenticated, showing confirmation dialog');
    
    console.log('🎯 Showing completion confirmation modal...');
    setShowCompletionModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!user) {
      console.log('❌ No user found');
      return;
    }
    
    console.log('✅ User confirmed job completion');
    console.log('🔄 Setting isProcessing to true');
    setShowCompletionModal(false);
    setIsProcessing(true);
    
    try {
      console.log('🔄 Starting job completion process...');
      console.log('🔄 Request ID:', request.id);
      console.log('🔄 User UID:', user.uid);
      
      const success = await requestService.completeRequest(request.id, user.uid);
      console.log('🔄 Complete request result:', success);
      
      if (success) {
        console.log('✅ Job completed successfully, showing success screen');
        setShowSuccessScreen(true);
      } else {
        console.log('❌ Failed to complete job');
        Alert.alert('Error', 'Failed to complete job. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error completing job:', error);
      Alert.alert('Error', 'Failed to complete job. Please try again.');
    } finally {
      console.log('🔄 Setting isProcessing to false');
      setIsProcessing(false);
    }
  };

  const handleCancelComplete = () => {
    console.log('❌ User cancelled job completion');
    setShowCompletionModal(false);
  };

  const openLocationInMaps = () => {
    requestService.openLocationInMaps(
      request.location.latitude,
      request.location.longitude,
      request.address
    );
  };

  const callCustomer = () => {
    requestService.callCustomer(request.customerPhone);
  };

  const handleQuoteClient = () => {
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = async () => {
    if (!quoteAmount.trim() || !quoteDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(quoteAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSubmittingQuote(true);
    try {
      console.log('💰 Submitting quote with amount:', amount, 'description:', quoteDescription);
      
      const success = await requestService.submitQuote(
        request.id,
        user?.uid || '',
        amount,
        quoteDescription
      );

      console.log('💰 Quote submission result:', success);

      if (success) {
        setHasQuote(true);
        setCurrentQuoteAmount(amount);
        setCurrentQuoteDescription(quoteDescription);
        console.log('✅ Quote submitted successfully, closing modal');
        
        // Close modal first
        setShowQuoteModal(false);
        setQuoteAmount('');
        setQuoteDescription('');
        
        // Show success alert
        Alert.alert(
          'Quote Sent Successfully!',
          `Quote of R${amount.toFixed(2)} has been sent to the customer.`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ Quote submission failed');
        Alert.alert('Error', 'Failed to send quote. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting quote:', error);
      Alert.alert('Error', 'Failed to send quote. Please try again.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCancelQuote = () => {
    setShowQuoteModal(false);
    setQuoteAmount('');
    setQuoteDescription('');
  };

  const handleOpenMessaging = async () => {
    if (!user?.uid || !mechanicProfile) return;

    try {
      console.log('🔍 Opening messaging for request:', request.requestId);
      
      // Create or get chat session
      const sessionId = await messagingService.createChatSession(
        request.requestId,
        user.uid,
        request.customerId,
        `${mechanicProfile.firstName} ${mechanicProfile.lastName}`,
        request.customerName
      );

      console.log('✅ Chat session created, setting showMessaging to true');
      setChatSessionId(sessionId);
      setShowMessaging(true);
      setUnreadCount(0); // Clear unread count when opening chat

      // Start listening to messages
      messagingService.listenToMessages(sessionId, (newMessages) => {
        console.log('📨 Received messages:', newMessages.length);
        setMessages(newMessages);
      });

    } catch (error) {
      console.error('❌ Error opening messaging:', error);
      Alert.alert('Error', 'Failed to open messaging. Please try again.');
    }
  };

  const handleCloseMessaging = () => {
    setShowMessaging(false);
    // Don't stop listening to messages - keep listening for new messages
    // This allows us to show badge count even when chat is closed
  };

  // Listen for messages even when chat is closed
  useEffect(() => {
    if (chatSessionId && !showMessaging) {
      // Listen for new messages when chat is closed
      const unsubscribe = messagingService.listenToMessages(chatSessionId, (newMessages) => {
        console.log('📨 Received messages (chat closed):', newMessages.length);
        setMessages(newMessages);
        
        // Count unread messages (messages from customer)
        const unreadMessages = newMessages.filter(msg => 
          msg.sender === 'customer' && 
          !msg.read // We'll add a 'read' field to track this
        );
        setUnreadCount(unreadMessages.length);
      });

      return unsubscribe;
    }
  }, [chatSessionId, showMessaging]);

  const handleSendMessage = async (messageText: string) => {
    if (!chatSessionId || !user?.uid || !mechanicProfile) return;

    try {
      await messagingService.sendMessage(chatSessionId, {
        text: messageText,
        sender: 'mechanic',
        senderId: user.uid,
        senderName: `${mechanicProfile.firstName} ${mechanicProfile.lastName}`,
        requestId: request.requestId,
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    // Stop listening to messages
    if (chatSessionId) {
      messagingService.stopListeningToMessages(chatSessionId);
    }
    
    // Call the original onComplete function to go back to dashboard
    onComplete();
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'battery':
        return 'battery-charging';
      case 'oil-change':
        return 'water';
      case 'tire-repair':
        return 'car';
      case 'brake-service':
        return 'hand-left';
      case 'engine-diagnostic':
        return 'settings';
      case 'ac-service':
        return 'snow';
      case 'electrical':
        return 'flash';
      default:
        return 'construct';
    }
  };

  const getServiceDisplayName = (serviceType: string) => {
    switch (serviceType) {
      case 'battery':
        return 'Battery Service';
      case 'oil-change':
        return 'Oil Change';
      case 'tire-repair':
        return 'Tire Repair';
      case 'brake-service':
        return 'Brake Service';
      case 'engine-diagnostic':
        return 'Engine Diagnostic';
      case 'ac-service':
        return 'AC Service';
      case 'electrical':
        return 'Electrical Repair';
      default:
        return 'General Service';
    }
  };

  // Show success screen if job is completed
  if (showSuccessScreen) {
    return (
      <JobSuccessScreen
        jobDetails={{
          customerName: request.customerName,
          serviceType: request.serviceType,
          amount: request.quoteAmount,
        }}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToDashboard} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Job</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.statusText}>Job Accepted</Text>
          </View>
          <Text style={styles.statusSubtext}>
            You're on your way to {request.customerName}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color={colors.primaryBlue} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{request.customerName}</Text>
                <Text style={styles.customerPhone}>{request.customerPhone}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
              <Ionicons name="call" size={20} color={colors.primaryBlue} />
              <Text style={styles.callButtonText}>Call Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceIconContainer}>
                <Ionicons 
                  name={getServiceIcon(request.serviceType)} 
                  size={24} 
                  color={colors.primaryBlue} 
                />
              </View>
              <Text style={styles.serviceType}>{getServiceDisplayName(request.serviceType)}</Text>
            </View>
            {request.description && (
              <Text style={styles.description}>{request.description}</Text>
            )}
          </View>
        </View>

        {/* Quote Details */}
        {hasQuote && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quote Details</Text>
            <View style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <Ionicons name="card" size={24} color={colors.warning} />
                            <Text style={styles.quoteAmount}>
              R{currentQuoteAmount?.toFixed(2) || '0.00'}
            </Text>
              </View>
              {currentQuoteDescription && (
                <Text style={styles.quoteDescription}>{currentQuoteDescription}</Text>
              )}
              <Text style={styles.quoteStatus}>Quote sent to customer</Text>
            </View>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <TouchableOpacity style={styles.locationCard} onPress={openLocationInMaps}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={colors.primaryBlue} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Navigate to Location</Text>
                {request.address && (
                  <Text style={styles.locationAddress}>{request.address}</Text>
                )}
                <Text style={styles.locationCoords}>
                  {request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.messageButton} onPress={handleOpenMessaging}>
            <View style={styles.messageButtonContent}>
              <Ionicons name="chatbubble" size={24} color={colors.textWhite} />
              <Text style={styles.messageButtonText}>Message Customer</Text>
            </View>
            {unreadCount > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.quoteButton} onPress={handleQuoteClient}>
            <Ionicons name="card" size={24} color={colors.textWhite} />
            <Text style={styles.quoteButtonText}>Quote Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeButton, 
              (isProcessing || !hasQuote) && styles.disabledButton
            ]}
            onPress={() => {
              console.log('🔍 Complete button pressed');
              console.log('🔍 Button disabled:', isProcessing || !hasQuote);
              console.log('🔍 isProcessing:', isProcessing);
              console.log('🔍 hasQuote:', hasQuote);
              handleComplete();
            }}
            disabled={isProcessing || !hasQuote}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.textWhite} />
            <Text style={styles.completeButtonText}>
              {isProcessing ? 'Completing...' : !hasQuote ? 'Quote Required' : 'Complete Job'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quote Modal */}
      <Modal
        visible={showQuoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelQuote}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quote Client</Text>
              <TouchableOpacity onPress={handleCancelQuote} style={styles.closeModalButton}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Amount (R)</Text>
              <TextInput
                style={styles.modalInput}
                value={quoteAmount}
                onChangeText={setQuoteAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={quoteDescription}
                onChangeText={setQuoteDescription}
                placeholder="Describe the services and parts included..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelQuote}
                disabled={isSubmittingQuote}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmittingQuote && styles.disabledButton]}
                onPress={handleSubmitQuote}
                disabled={isSubmittingQuote}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {isSubmittingQuote ? 'Sending...' : 'Send Quote'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Completion Confirmation Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelComplete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Job</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>
                Are you sure you want to mark this job as completed?
              </Text>
              <Text style={[styles.modalLabel, { marginTop: 10, fontSize: 14, color: '#666' }]}>
                This action cannot be undone.
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCancelComplete}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmComplete}
                style={[styles.modalSubmitButton, isProcessing && styles.disabledButton]}
                disabled={isProcessing}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {isProcessing ? 'Completing...' : 'Complete Job'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Message Box */}
      {showMessaging && (
        <FloatingMessageBox
          isVisible={showMessaging}
          onClose={handleCloseMessaging}
          customerName={request.customerName}
          onSendMessage={handleSendMessage}
          messages={messages}
        />
      )}
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
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  statusCard: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textWhite,
    marginLeft: spacing.sm,
  },
  statusSubtext: {
    fontSize: fontSize.base,
    color: colors.textWhite,
    opacity: 0.9,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  customerCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  customerPhone: {
    fontSize: fontSize.base,
    color: colors.textMedium,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  callButtonText: {
    color: colors.primaryBlue,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  serviceCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  serviceType: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    lineHeight: 22,
  },
  locationCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  locationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
    marginBottom: spacing.xs,
  },
  locationCoords: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  actionSection: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  messageButton: {
    backgroundColor: colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  messageButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  completeButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  completeButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  quoteButton: {
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  quoteButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.xl,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  closeModalButton: {
    padding: spacing.xs,
  },
  modalContent: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textDark,
    backgroundColor: colors.bgSecondary,
    marginBottom: spacing.lg,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: colors.textDark,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalSubmitButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  quoteCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quoteAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  quoteDescription: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  quoteStatus: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  messageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  messageBadgeText: {
    color: colors.textWhite,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

});
