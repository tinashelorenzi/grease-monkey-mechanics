import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

interface MainAppScreenProps {
  onLogout: () => void;
}

export default function MainAppScreen({ onLogout }: MainAppScreenProps) {
  const { user, mechanicProfile } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🔧</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.appTitle}>Grease Monkey</Text>
            <Text style={styles.appSubtitle}>Mechanics App</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome, {mechanicProfile?.firstName || user?.displayName || 'Mechanic'}!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Your mechanic services platform is ready to help you grow your business.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>View Jobs</Text>
            <Text style={styles.actionSubtitle}>Check available jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionTitle}>Earnings</Text>
            <Text style={styles.actionSubtitle}>View your income</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Manage your profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionTitle}>Support</Text>
            <Text style={styles.actionSubtitle}>Get help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Account Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Profile:</Text>
          <Text style={styles.statusValue}>Complete ✓</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Verification:</Text>
          <Text style={styles.statusValue}>Pending ⏳</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Available:</Text>
          <Text style={styles.statusValue}>Online 🟢</Text>
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
  header: {
    backgroundColor: colors.bgPrimary,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
    ...shadows.md,
  },
  logoText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  appTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryBlue,
  },
  appSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  logoutButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  welcomeSection: {
    padding: spacing.xl,
    backgroundColor: colors.bgPrimary,
    margin: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  welcomeTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    lineHeight: 22,
  },
  actionsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.bgPrimary,
    width: '48%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: colors.bgPrimary,
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  statusTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statusLabel: {
    fontSize: fontSize.base,
    color: colors.textMedium,
  },
  statusValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
  },
});
