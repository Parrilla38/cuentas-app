import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { showAlert } from '@/utils/alert'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const resetPassword = useAuthStore((s) => s.resetPassword)

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Por favor ingresa tu email')
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email.trim())
      showAlert(
        'Email enviado',
        'Te hemos enviado un email con instrucciones para restablecer tu contraseña.',
        () => router.replace('/auth/login' as any)
      )
    } catch (error: any) {
      showAlert('Error', error.message || 'No se pudo enviar el email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <Button
              title="Enviar enlace"
              onPress={handleResetPassword}
              disabled={isLoading}
            />

            <Pressable
              onPress={() => router.replace('/auth/login' as any)}
              style={styles.backToLogin}
            >
              <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  description: {
    marginBottom: Spacing.xl,
  },
  descriptionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backToLogin: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  backToLoginText: {
    fontSize: FontSize.md,
    color: Colors.accentCyan,
    fontWeight: FontWeight.medium,
  },
})
