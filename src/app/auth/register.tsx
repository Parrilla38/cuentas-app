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
import { Ionicons } from '@expo/vector-icons'

import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { showAlert } from '@/utils/alert'

export default function RegisterScreen() {
  const router = useRouter()
  const signUp = useAuthStore((s) => s.signUp)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert('Error', 'Por favor completa todos los campos')
      return
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      await signUp(email.trim(), password)
      showAlert(
        'Cuenta creada',
        'Te hemos enviado un email de confirmación. Por favor verifica tu correo.',
        () => router.replace('/auth/login' as any)
      )
    } catch (error: any) {
      showAlert('Error', error.message || 'No se pudo crear la cuenta')
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
          <Text style={styles.title}>Crear cuenta</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <Button
              title="Crear cuenta"
              onPress={handleRegister}
              disabled={isLoading}
            />
          </View>

          <Pressable
            onPress={() => router.replace('/auth/login' as any)}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </Pressable>
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
    paddingVertical: Spacing.md,
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.medium,
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
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginButton: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loginText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.accentCyan,
    fontWeight: FontWeight.semibold,
  },
})