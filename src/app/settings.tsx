import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { shareBackup } from '@/services/backup'

export default function SettingsScreen() {
  const router = useRouter()
  const {
    monthlySalary,
    savingsPercentage,
    setMonthlySalary,
    setSavingsPercentage,
    signOut,
  } = useAuthStore()

  const [salary, setSalary] = useState(String(monthlySalary))
  const [savings, setSavings] = useState(String(savingsPercentage))
  const [backupPassword, setBackupPassword] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleSaveSalary = useCallback(() => {
    const val = parseFloat(salary.replace(',', '.'))
    if (!isNaN(val) && val >= 0) {
      setMonthlySalary(val)
    }
  }, [salary, setMonthlySalary])

  const handleSaveSavings = useCallback(() => {
    const val = parseFloat(savings.replace(',', '.'))
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setSavingsPercentage(val)
    }
  }, [savings, setSavingsPercentage])

  const handleExportBackup = useCallback(async () => {
    setIsExporting(true)
    try {
      await shareBackup(backupPassword)
    } catch {
      Alert.alert('Error', 'No se pudo exportar el backup')
    }
    setIsExporting(false)
  }, [backupPassword])

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/auth/login' as any)
          },
        },
      ],
    )
  }, [signOut, router])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Ajustes</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Perfil</Text>
        <Card>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Salario mensual</Text>
            <View style={styles.inlineInput}>
              <TextInput
                style={styles.inlineTextInput}
                value={salary}
                onChangeText={setSalary}
                keyboardType="decimal-pad"
                onBlur={handleSaveSalary}
              />
              <Text style={styles.inlineCurrency}>€</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Objetivo ahorro (%)</Text>
            <View style={styles.inlineInput}>
              <TextInput
                style={styles.inlineTextInput}
                value={savings}
                onChangeText={setSavings}
                keyboardType="decimal-pad"
                onBlur={handleSaveSavings}
              />
              <Text style={styles.inlineCurrency}>%</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Card>
          <Pressable onPress={handleSignOut} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="lock.fill" size={20} color={Colors.danger} />
              <Text style={[styles.settingLabel, { color: Colors.danger }]}>Cerrar sesión</Text>
            </View>
            <Icon name="chevron.left" size={16} color={Colors.textSecondary} />
          </Pressable>
        </Card>

        <Text style={styles.sectionTitle}>Datos</Text>
        <Card>
          <Text style={styles.settingLabel}>Contraseña backup (opcional)</Text>
          <TextInput
            style={styles.passwordInput}
            value={backupPassword}
            onChangeText={setBackupPassword}
            placeholder="Contraseña para cifrar..."
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
          />
          <Button
            title={isExporting ? 'Exportando...' : 'Exportar backup'}
            onPress={handleExportBackup}
            disabled={isExporting}
            variant="secondary"
            style={styles.exportButton}
          />
        </Card>

        <Text style={styles.sectionTitle}>Herramientas</Text>
        <Pressable onPress={() => router.push('/tools' as any)}>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="chart.line.uptrend.xyaxis" size={20} color={Colors.accentViolet} />
                <Text style={styles.settingLabel}>Calculadoras financieras</Text>
              </View>
              <Icon name="chevron.left" size={16} color={Colors.textSecondary} />
            </View>
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/help' as any)}>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="book.outline" size={20} color={Colors.accentCyan} />
                <Text style={styles.settingLabel}>Guía de la app</Text>
              </View>
              <Icon name="chevron.left" size={16} color={Colors.textSecondary} />
            </View>
          </Card>
        </Pressable>

        <Text style={styles.sectionTitle}>Metas de ahorro</Text>
        <Pressable onPress={() => router.push('/savings' as any)}>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="target" size={20} color={Colors.savings} />
                <Text style={styles.settingLabel}>Gestionar metas</Text>
              </View>
              <Icon name="chevron.left" size={16} color={Colors.textSecondary} />
            </View>
          </Card>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Cuentas APP v1.0.0</Text>
          <Text style={styles.footerSubtext}>Todos los datos se almacenan localmente</Text>
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
    paddingVertical: Spacing.sm,
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
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inlineTextInput: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    paddingVertical: Spacing.xs,
    minWidth: 60,
    textAlign: 'right',
  },
  inlineCurrency: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginLeft: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.savings,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textSecondary,
  },
  toggleKnobActive: {
    backgroundColor: Colors.textPrimary,
    alignSelf: 'flex-end',
  },
  passwordInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  exportButton: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  footerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
})
