import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';

interface JobSuccessScreenProps {
  onBackToDashboard: () => void;
  jobDetails: {
    customerName: string;
    serviceType: string;
    amount?: number;
  };
}

const { width, height } = Dimensions.get('window');

export default function JobSuccessScreen({
  onBackToDashboard,
  jobDetails,
}: JobSuccessScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success screen entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

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
        return 'Electrical Service';
      default:
        return 'General Service';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.background} />
      
      {/* Success content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success icon */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                opacity: checkmarkAnim,
                transform: [{ scale: checkmarkAnim }],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </Animated.View>
        </View>

        {/* Success title */}
        <Text style={styles.title}>Job Completed!</Text>
        <Text style={styles.subtitle}>
          Great work! You've successfully completed the service.
        </Text>

        {/* Job details card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color={colors.primaryBlue} />
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{jobDetails.customerName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="construct" size={20} color={colors.primaryBlue} />
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>
              {getServiceDisplayName(jobDetails.serviceType)}
            </Text>
          </View>
          
          {jobDetails.amount && (
            <View style={styles.detailRow}>
              <Ionicons name="card" size={20} color={colors.warning} />
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>R{jobDetails.amount.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBackToDashboard}
          >
            <Ionicons name="home" size={20} color={colors.textWhite} />
            <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Celebration emojis */}
        <View style={styles.celebration}>
          <Text style={styles.celebrationText}>🎉 🚗 🔧 💪</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.success,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    minWidth: 80,
  },
  detailValue: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    flex: 1,
  },
  actions: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  celebration: {
    marginTop: spacing.xl,
  },
  celebrationText: {
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
});
