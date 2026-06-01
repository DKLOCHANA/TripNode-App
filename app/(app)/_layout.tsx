import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme/ThemeContext';
import { useTripNotificationSync } from '@/hooks/useTripNotificationSync';

/**
 * The tab bar background is painted here, from an always-mounted component that
 * subscribes to the theme directly. Setting the background through per-screen
 * `tabBarStyle` options instead let react-native-screens cache a stale value
 * when navigating into a nested stack (e.g. My Trips → itinerary detail and
 * back), so the bar kept the previous theme's colour. Passing the colour via
 * the `style` prop overrides the cached `tabBarStyle` (see BottomTabBar:
 * `style: [tabBarStyle, style]`), so the bar always tracks the live theme.
 */
function ThemedTabBar(props: BottomTabBarProps) {
  const { colors } = useTheme();
  return (
    <BottomTabBar
      {...props}
      style={{
        backgroundColor: colors.tabBarBackground,
        borderTopColor: colors.tabBarBorder,
        borderTopWidth: 0.5,
      }}
    />
  );
}

export default function AppLayout() {
  const { colors } = useTheme();

  // Keeps trip reminders in sync with saved trips, the user's preference and
  // the live OS permission state for the whole authenticated session.
  useTripNotificationSync();

  return (
    <Tabs
      tabBar={(props) => <ThemedTabBar {...props} />}
      screenOptions={() => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tabs.Screen
        name="plan/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription/index"
        options={{
          href: null, // Hide from tab bar - accessed via profile
        }}
      />
    </Tabs>
  );
}
