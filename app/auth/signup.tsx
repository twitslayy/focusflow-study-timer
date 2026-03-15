import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { LogoMark } from '@/components/auth/LogoMark'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { ErrorMessage } from '@/components/auth/ErrorMessage'
import { spacing, typography } from '@/constants/design'

const ONBOARDING_KEY = 'onboarding_completed'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignupScreen() {
  const { signUp } = useAuth()
  const { colors, isDark } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    const result = await signUp(email.trim(), password, name.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      router.replace('/(tabs)')
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <LogoMark size={60} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start your focus journey today
          </Text>

          <View style={styles.form}>
            <ErrorMessage message={error} />

            <AuthInput
              icon="person-outline"
              placeholder="Full name"
              autoCapitalize="words"
              autoCorrect={false}
              value={name}
              onChangeText={setName}
              isDark={isDark}
            />

            <AuthInput
              icon="mail-outline"
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              isDark={isDark}
            />

            <AuthInput
              icon="lock-closed-outline"
              placeholder="Password (min 8 characters)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword((v) => !v)}
              isDark={isDark}
            />

            <AuthInput
              icon="lock-closed-outline"
              placeholder="Confirm password"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirm((v) => !v)}
              isDark={isDark}
            />

            <View style={styles.gap} />
            <AuthButton label="Create Account" onPress={handleSignUp} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  gap: { height: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: { ...typography.caption },
  linkText: { ...typography.captionBold },
})
