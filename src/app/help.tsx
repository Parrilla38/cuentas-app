import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { Card, BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'

const GUIDE_SECTIONS = [
  {
    icon: 'home-outline',
    title: 'Inicio',
    description: 'Aquí ves un resumen de tu situación financiera. El ahorro del mes se calcula restando gastos de ingresos. La salud financiera te da una puntuación de 0 a 100 según cómo vas.',
    color: Colors.accentCyan,
  },
  {
    icon: 'swap-horizontal-outline',
    title: 'Movimientos',
    description: 'Registra todas tus transacciones (ingresos y gastos) con categoría, fecha y descripción. Desde aquí puedes añadir, editar o eliminar movimientos. También puedes filtrar por mes.',
    color: Colors.success,
  },
  {
    icon: 'hand-raised-outline',
    title: 'Préstamos',
    description: 'Controla préstamos que hayas dado o recibido. Añade el monto, plazo y tasa de interés. La app calcula automáticamente las cuotas y échéancier de pago.',
    color: Colors.warning,
  },
  {
    icon: 'pie-chart-outline',
    title: 'Presupuestos',
    description: 'Define límites de gasto mensuales por categoría. La app te avisa cuando alcances el 70%, 90% o 100% del presupuesto. Así evitas gastar de más.',
    color: Colors.accentViolet,
  },
  {
    icon: 'bar-chart-outline',
    title: 'Reportes',
    description: 'Analiza tus finanzas con gráficos de ingresos vs gastos por mes. Puedes exportar tus datos a CSV para analisarlos en Excel.',
    color: Colors.danger,
  },
  {
    icon: 'wallet-outline',
    title: 'Ahorros',
    description: 'Crea metas de ahorro (vacaciones, coche, emergencia). Añade contribuciones y sigue tu progreso. La app te dice cuánto falta para alcanzar tu meta.',
    color: Colors.savings,
  },
  {
    icon: 'calculator-outline',
    title: 'Herramientas',
    description: 'Calculadora de préstamos (cuota, total intereses) y calculadora de interés compuesto. Útiles para planificarse antes de pedir un crédito.',
    color: Colors.textSecondary,
  },
  {
    icon: 'repeat-outline',
    title: 'Gastos Recurrentes',
    description: 'Configura gastos que se repiten cada mes (alquiler, gimnasio, Netflix). La app los genera automáticamente para que no tengas que añadirlos manualmente.',
    color: Colors.textSecondary,
  },
]

export default function HelpScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Guía de la app</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Esta app te ayuda a gestionar tus finanzas personales. Cada sección tiene una función específica:
        </Text>

        {GUIDE_SECTIONS.map((section, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
                <Ionicons name={section.icon as any} size={22} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.description}>{section.description}</Text>
          </Card>
        ))}

        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
            <Text style={styles.tipTitle}>Consejo</Text>
          </View>
          <Text style={styles.tipText}>
            Usa el botón + azul para añadir transacciones rápidamente. Cuanto más uses la app, mejores serán los reportes y análisis de tus finanzas.
          </Text>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Tienes dudas o sugerencias? Escríbenos a soporte@cuentasapp.com
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  intro: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: Colors.warning + '10',
    borderColor: Colors.warning + '30',
    padding: Spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
})