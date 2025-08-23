import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';

interface BottomNavigationProps {
  currentScreen: string;
  isOnline: boolean;
  onNavigate: (screen: string) => void;
  onToggleOnline: () => void;
}

export default function BottomNavigation({
  currentScreen,
  isOnline,
  onNavigate,
  onToggleOnline,
}: BottomNavigationProps) {
  const navItems = [
    {
      id: 'history',
      label: 'History',
      icon: 'time-outline',
      activeIcon: 'time',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: 'card-outline',
      activeIcon: 'card',
    },
    {
      id: 'messaging',
      label: 'Messages',
      icon: 'chatbubble-outline',
      activeIcon: 'chatbubble',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Navigation Items with Center Button */}
      <View style={styles.navContainer}>
        {navItems.map((item, index) => {
          const isActive = currentScreen === item.id;
          
          // Insert center button after the second item
          if (index === 2) {
            return (
              <React.Fragment key={`center-${index}`}>
                {/* Center Online/Offline Button */}
                <View style={styles.centerButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.centerButton,
                      isOnline && styles.centerButtonActive
                    ]}
                    onPress={onToggleOnline}
                    onLongPress={() => onNavigate('dashboard')}
                    delayLongPress={500}
                  >
                    <View style={styles.centerButtonInner}>
                      <Ionicons
                        name={isOnline ? 'radio-button-on' : 'radio-button-off'}
                        size={24}
                        color={isOnline ? colors.textWhite : colors.primaryBlue}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.centerButtonLabel}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
                
                {/* Navigation Item */}
                <TouchableOpacity
                  key={item.id}
                  style={styles.navItem}
                  onPress={() => onNavigate(item.id)}
                >
                  <Ionicons
                    name={isActive ? item.activeIcon : item.icon}
                    size={24}
                    color={isActive ? colors.primaryBlue : colors.textMedium}
                  />
                  <Text style={[
                    styles.navLabel,
                    isActive && styles.navLabelActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          }
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => onNavigate(item.id)}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={24}
                color={isActive ? colors.primaryBlue : colors.textMedium}
              />
              <Text style={[
                styles.navLabel,
                isActive && styles.navLabelActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPrimary,
    paddingVertical: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.base,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 50,
  },
  navLabel: {
    fontSize: fontSize.xs,
    color: colors.textMedium,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  navLabelActive: {
    color: colors.primaryBlue,
    fontWeight: fontWeight.semibold,
  },
  centerButtonContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  centerButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  centerButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonLabel: {
    fontSize: fontSize.xs,
    color: colors.textMedium,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
