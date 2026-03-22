import React from 'react';
import { Tabs } from 'expo-router';
import { AppProvider } from '../src/context/AppContext';
import { View, StyleSheet, Text } from 'react-native';

// Tab icon component using emojis for reliable rendering
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{emoji}</Text>
);

export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: {
            flex: 1,
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: 'Collection',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🃏" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🛒" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏆" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="trade"
          options={{
            title: 'Trade',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🔄" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👤" focused={focused} />
            ),
          }}
        />
        {/* Hidden screens - not shown in tab bar */}
        <Tabs.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
            tabBarButton: () => null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="payment-success"
          options={{
            title: 'Payment Success',
            tabBarButton: () => null, // Hide from tab bar
          }}
        />
      </Tabs>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopColor: '#333',
    borderTopWidth: 1,
    paddingBottom: 12,
    paddingTop: 10,
    height: 75,
    paddingHorizontal: 0,
    justifyContent: 'space-around',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIcon: {
    fontSize: 28,
  },
  tabIconFocused: {
    transform: [{ scale: 1.2 }],
  },
});
