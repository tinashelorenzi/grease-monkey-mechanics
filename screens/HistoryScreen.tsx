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

interface HistoryScreenProps {
  onNavigateToDashboard: () => void;
}

export default function HistoryScreen({ onNavigateToDashboard }: HistoryScreenProps) {
  const mockJobs = [
    {
      id: '1',
      clientName: 'John Smith',
      service: 'Oil Change',
      date: '2024-01-15',
      amount: 45,
      status: 'completed',
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      service: 'Brake Repair',
      date: '2024-01-14',
      amount: 120,
      status: 'completed',
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      service: 'Tire Replacement',
      date: '2024-01-13',
      amount: 85,
      status: 'completed',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToDashboard} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockJobs.length}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              R{mockJobs.reduce((sum, job) => sum + job.amount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Jobs</Text>

        {mockJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobService}>{job.service}</Text>
              <Text style={styles.jobAmount}>R{job.amount}</Text>
            </View>
            <Text style={styles.jobClient}>Client: {job.clientName}</Text>
            <Text style={styles.jobDate}>Date: {job.date}</Text>
                    <View style={styles.jobStatus}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.statusText}>Completed</Text>
        </View>
          </View>
        ))}

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No more jobs to show
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Your completed jobs will appear here
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
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
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primaryBlue,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  jobCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  jobService: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  jobAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  jobClient: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    marginBottom: spacing.xs,
  },
  jobDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  jobStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
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
