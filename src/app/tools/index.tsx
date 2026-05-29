import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants'

const TOOLS = [
  {
    id: 'loan-calc',
    title: 'Calculadora de préstamos',
    description: 'Calcula cuotas, intereses y tabla de amortización',
    icon: 'eurosign.circle.fill',
    color: '#6366F1',
    route: '/tools/loan-calc',
  },
  {
    id: 'compound',
    title: 'Interés compuesto',
    description: 'Simula el crecimiento de tus inversiones',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#10B981',
    route: '/tools/compound',
  },
  {
    id: 'rule-50-30-20',
    title: 'Regla 50/30/20',
    description: 'Distribuye tu salario según la regla popular',
    icon: 'chart.pie.fill',
    color: '#F59E0B',
    route: '/tools/loan-calc',
  },
]

export default function ToolsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Herramientas</Text>
        <Text style={styles.subtitle}>Calculadoras financieras</Text>

        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.id}
              onPress={() => router.push(tool.route as any)}
            >
              <Card style={styles.toolCard}>
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                  <Icon name={tool.icon} size={28} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDesc}>{tool.description}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: -Spacing.md,
  },
  grid: {
    gap: Spacing.md,
  },
  toolCard: {
    gap: Spacing.sm,
  },
  toolIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  toolDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
})
