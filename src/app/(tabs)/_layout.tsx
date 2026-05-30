import { Tabs } from 'expo-router'
import { Platform, StyleSheet, type ColorValue } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors } from '@/constants/colors'

function TabIcon({ name, color }: { name: string; color: ColorValue }) {
  return <Icon name={name} size={22} color={color} />
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accentCyan,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <TabIcon name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Movimientos',
          tabBarIcon: ({ color }) => (
            <TabIcon name="arrow.triangle.2.circlepath" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Préstamos',
          tabBarIcon: ({ color }) => (
            <TabIcon name="hand.raised.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ color }) => (
            <TabIcon name="chart.pie.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => (
            <TabIcon name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabBarItem: {
    paddingVertical: 2,
  },
})