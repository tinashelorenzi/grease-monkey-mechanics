import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import BottomNavigation from './BottomNavigation';

interface MainAppLayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  isOnline: boolean;
  onNavigate: (screen: string) => void;
  onToggleOnline: () => void;
}

export default function MainAppLayout({
  children,
  currentScreen,
  isOnline,
  onNavigate,
  onToggleOnline,
}: MainAppLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Persistent Bottom Navigation */}
      <BottomNavigation
        currentScreen={currentScreen}
        isOnline={isOnline}
        onNavigate={onNavigate}
        onToggleOnline={onToggleOnline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  content: {
    flex: 1,
  },
});
