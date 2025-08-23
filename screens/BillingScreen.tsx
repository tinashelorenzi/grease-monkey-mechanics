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

interface BillingScreenProps {
  onNavigateToDashboard: () => void;
}

export default function BillingScreen({ onNavigateToDashboard }: BillingScreenProps) {
  const mockEarnings = [
    { month: 'January 2024', amount: 1250, jobs: 15 },
    { month: 'December 2023', amount: 980, jobs: 12 },
    { month: 'November 2023', amount: 1100, jobs: 14 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToDashboard} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing & Earnings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>R{mockEarnings[0].amount}</Text>
            <Text style={styles.summaryJobs}>{mockEarnings[0].jobs} jobs</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={styles.summaryAmount}>
              R{mockEarnings.reduce((sum, month) => sum + month.amount, 0)}
            </Text>
            <Text style={styles.summaryJobs}>All time</Text>
          </View>
        </View>

        {/* Monthly Breakdown */}
        <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
        
        {mockEarnings.map((month, index) => (
          <View key={index} style={styles.monthCard}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthName}>{month.month}</Text>
              <Text style={styles.monthAmount}>R{month.amount}</Text>
            </View>
            <Text style={styles.monthJobs}>{month.jobs} jobs completed</Text>
          </View>
        ))}

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Direct Deposit</Text>
          <Text style={styles.paymentSubtitle}>Payments are processed weekly</Text>
          <TouchableOpacity style={styles.paymentButton}>
            <Ionicons name="card" size={16} color={colors.textWhite} style={{ marginRight: spacing.xs }} />
            <Text style={styles.paymentButtonText}>Update Payment Info</Text>
          </TouchableOpacity>
        </View>

        {/* Tax Information */}
        <Text style={styles.sectionTitle}>Tax Information</Text>
        <View style={styles.taxCard}>
          <Text style={styles.taxTitle}>1099-K Form</Text>
          <Text style={styles.taxSubtitle}>Available for tax filing</Text>
          <TouchableOpacity style={styles.taxButton}>
            <Ionicons name="document-text" size={16} color={colors.primaryBlue} style={{ marginRight: spacing.xs }} />
            <Text style={styles.taxButtonText}>Download 1099-K</Text>
          </TouchableOpacity>
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
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  summaryCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  summaryJobs: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  monthCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  monthName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  monthAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  monthJobs: {
    fontSize: fontSize.sm,
    color: colors.textMedium,
  },
  paymentCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  paymentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  paymentSubtitle: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    marginBottom: spacing.lg,
  },
  paymentButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  taxCard: {
    backgroundColor: colors.bgPrimary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  taxTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  taxSubtitle: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    marginBottom: spacing.lg,
  },
  taxButton: {
    backgroundColor: colors.accentBlue,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  taxButtonText: {
    color: colors.primaryBlue,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});
