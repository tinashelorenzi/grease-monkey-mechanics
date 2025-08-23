import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        React Native Test
      </Text>
      <Text style={styles.subtitle}>
        If you can see this styled text, React Native styling is working! 🎉
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#1d4ed8',
    textAlign: 'center',
  },
});
