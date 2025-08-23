import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import locationService, { MechanicStatus, LocationData } from '../services/locationService';

interface DashboardScreenProps {
  onNavigateToHistory: () => void;
  onNavigateToBilling: () => void;
  onNavigateToMessaging: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  onOnlineStatusChange?: (isOnline: boolean) => void;
}

export default function DashboardScreen({
  onNavigateToHistory,
  onNavigateToBilling,
  onNavigateToMessaging,
  onNavigateToSettings,
  onLogout,
  onOnlineStatusChange,
}: DashboardScreenProps) {
  const { user, mechanicProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Initialize location and status
  useEffect(() => {
    initializeLocationAndStatus();
  }, []);

  // Listen to mechanic status changes
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = locationService.listenToMechanicStatus(user.uid, (status: MechanicStatus) => {
        setIsOnline(status.isOnline);
        setLocation(status.location);
        // Notify parent component of online status change
        onOnlineStatusChange?.(status.isOnline);
      });

      return unsubscribe;
    }
  }, [user?.uid, onOnlineStatusChange]);

  // Pulse animation for online status
  useEffect(() => {
    if (isOnline) {
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
    }
  }, [isOnline]);

  const initializeLocationAndStatus = async () => {
    try {
      // Check location permission
      const hasPermission = await locationService.requestPermissions();
      setLocationPermission(hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to match you with nearby clients.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get cached status
      const cachedStatus = await locationService.getCachedOnlineStatus();
      setIsOnline(cachedStatus);

      // Get cached location
      const cachedLocation = await locationService.getCachedLocationData();
      setLocation(cachedLocation);

      // Start location tracking if user is authenticated
      if (user?.uid) {
        await locationService.startLocationTracking(user.uid);
      }
    } catch (error) {
      console.error('Error initializing location and status:', error);
    }
  };

  // Toggle online/offline status
  const toggleOnlineStatus = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      if (!isOnline) {
        // Going online
        const currentLocation = await locationService.getCurrentLocation();
        if (currentLocation) {
          await locationService.updateOnlineStatus(user.uid, true);
          setIsOnline(true);
          onOnlineStatusChange?.(true);
        } else {
          Alert.alert('Error', 'Could not get your current location');
        }
      } else {
        // Going offline
        await locationService.updateOnlineStatus(user.uid, false);
        setIsOnline(false);
        onOnlineStatusChange?.(false);
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      Alert.alert('Error', 'Failed to update online status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusIndicator}>
          <Animated.View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: isOnline ? colors.success : colors.textLight,
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {mechanicProfile?.firstName || user?.displayName || 'Mechanic'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.userRating}>
              {mechanicProfile?.rating || 0} ({mechanicProfile?.totalJobs || 0} jobs)
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Ionicons 
            name={isOnline ? "checkmark-circle" : "radio-button-off"} 
            size={48} 
            color={isOnline ? colors.success : colors.textLight} 
          />
          <Text style={styles.welcomeTitle}>
            {isOnline ? 'Ready for Jobs!' : 'Go Online to Start'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {isOnline 
              ? 'You\'re visible to nearby clients' 
              : 'Tap the button below to start receiving job requests'
            }
          </Text>
        </View>

        {/* Online/Offline Toggle Button */}
        <TouchableOpacity
          style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
          onPress={toggleOnlineStatus}
          disabled={isLoading}
        >
          <View style={styles.onlineButtonInner}>
            <Ionicons
              name={isOnline ? "radio-button-on" : "radio-button-off"}
              size={48}
              color={isOnline ? colors.textWhite : colors.primaryBlue}
            />
            <Text style={styles.onlineButtonText}>
              {isLoading ? 'Updating...' : (isOnline ? 'Online' : 'Go Online')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={24} color={colors.primaryBlue} />
            <Text style={styles.statNumber}>{mechanicProfile?.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={24} color={colors.success} />
            <Text style={styles.statNumber}>R{mechanicProfile?.totalEarnings || 0}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={colors.warning} />
            <Text style={styles.statNumber}>{mechanicProfile?.rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Location Status */}
        <View style={styles.locationStatus}>
          <View style={styles.locationHeader}>
            <Ionicons 
              name="location" 
              size={20} 
              color={locationPermission ? colors.success : colors.textLight} 
            />
            <Text style={styles.locationStatusText}>
              Location: {locationPermission ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          {location && (
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  statusBar: {
    backgroundColor: colors.bgPrimary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  userRating: {
    fontSize: fontSize.xs,
    color: colors.textMedium,
    marginLeft: spacing.xs,
  },
  mainContent: {
    flex: 1,
    padding: spacing.xl,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  welcomeTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  onlineButton: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  onlineButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  onlineButtonInner: {
    alignItems: 'center',
  },
  onlineButtonIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  onlineButtonText: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryBlue,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
    textAlign: 'center',
  },
  locationStatus: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  locationStatusText: {
    fontSize: fontSize.base,
    color: colors.textDark,
    marginLeft: spacing.xs,
  },
  locationCoords: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
    textAlign: 'center',
  },
});
