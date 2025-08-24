import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';
import { ServiceRequest } from '../services/requestService';
import requestService from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';

interface RequestNotificationScreenProps {
  request: ServiceRequest;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function RequestNotificationScreen({
  request,
  onAccept,
  onDecline,
  onClose,
}: RequestNotificationScreenProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Pulse animation for the accept button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleAccept = async () => {
    if (!user?.uid) return;
    
    setIsProcessing(true);
    try {
      const success = await requestService.acceptRequest(request.id, user.uid);
      if (success) {
        onAccept();
      } else {
        Alert.alert('Error', 'Failed to accept request. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!user?.uid) return;
    
    setIsProcessing(true);
    try {
      const success = await requestService.declineRequest(request.id, user.uid);
      if (success) {
        onDecline();
      } else {
        Alert.alert('Error', 'Failed to decline request. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={colors.primaryBlue} />
          </View>
          <Text style={styles.customerName}>{request.customerName}</Text>
          <Text style={styles.customerPhone}>{request.customerPhone}</Text>
        </View>

        {/* Service Details */}
        <View style={styles.serviceSection}>
          <View style={styles.serviceIconContainer}>
            <Ionicons 
              name={getServiceIcon(request.serviceType)} 
              size={32} 
              color={colors.primaryBlue} 
            />
          </View>
          <Text style={styles.serviceType}>{getServiceDisplayName(request.serviceType)}</Text>
          {request.description && (
            <Text style={styles.description}>{request.description}</Text>
          )}
          {request.address && (
            <Text style={styles.address}>{request.address}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.acceptButton, isProcessing && styles.disabledButton]}
              onPress={handleAccept}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark" size={32} color={colors.textWhite} />
              <Text style={styles.acceptButtonText}>
                {isProcessing ? 'Accepting...' : 'Accept'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.declineButton, isProcessing && styles.disabledButton]}
            onPress={handleDecline}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={32} color={colors.textWhite} />
            <Text style={styles.declineButtonText}>
              {isProcessing ? 'Declining...' : 'Decline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Call Customer Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => requestService.callCustomer(request.customerPhone)}
        >
          <Ionicons name="call" size={20} color={colors.primaryBlue} />
          <Text style={styles.callButtonText}>Call Customer</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    margin: spacing.xl,
    width: width - spacing.xl * 2,
    maxHeight: height * 0.8,
    ...shadows.lg,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  closeButton: {
    padding: spacing.sm,
  },
  customerSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  customerName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  customerPhone: {
    fontSize: fontSize.base,
    color: colors.textMedium,
  },
  serviceSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  serviceType: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  address: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  acceptButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 120,
    ...shadows.md,
  },
  declineButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 120,
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  declineButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
  },
  callButtonText: {
    color: colors.primaryBlue,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
});
