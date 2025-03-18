import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/theme/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Story',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="rtvi"
          options={{
            title: 'RTVI',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="waveform.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'About',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle.fill" color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
