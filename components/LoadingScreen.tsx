import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../styles/colors';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🔧</Text>
      </View>
      <Text style={styles.appTitle}>Grease Monkey</Text>
      <Text style={styles.appSubtitle}>Mechanics App</Text>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.primaryBlue,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textMedium,
    fontWeight: fontWeight.medium,
    marginBottom: spacing['3xl'],
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.base,
    color: colors.textMedium,
    fontWeight: fontWeight.medium,
  },
});
