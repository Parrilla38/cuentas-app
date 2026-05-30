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

import { Button } from '@/components/ui'
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants'
import { useAuthStore } from '@/stores/auth'
import { showAlert } from '@/utils/alert'

export default function LoginScreen() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    try {
      await signIn(email.trim(), password)
      router.replace('/(tabs)' as any)
    } catch (error: any) {
      showAlert('Error', error.message || 'No se pudo iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: any) {
      showAlert('Error', error.message || 'No se pudo iniciar sesión con Google')
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="wallet-outline" size={40} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.title}>Cuentas</Text>
            <Text style={styles.subtitle}>Gestiona tus finanzas fácil</Text>
          </View>

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
                placeholder="••••••••"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable onPress={() => router.push('/auth/forgot-password' as any)}>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <Button
              title="Iniciar sesión"
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} color={Colors.textPrimary} />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/auth/register' as any)}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.medium,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
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
  forgotPassword: {
    fontSize: FontSize.sm,
    color: Colors.accentCyan,
    textAlign: 'right',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    ...Shadow.small,
  },
  googleButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
  registerButton: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    color: Colors.accentCyan,
    fontWeight: FontWeight.semibold,
  },
})