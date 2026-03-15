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
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { ErrorMessage } from '@/components/auth/ErrorMessage'
import { spacing, typography, borderRadius } from '@/constants/design'

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function SuccessState({ colors }: { colors: any }) {
  return (
    <View style={successStyles.container}>
      <View style={[successStyles.iconCircle, { backgroundColor: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)' }]}>
        <Ionicons name="mail-outline" size={52} color="#818CF8" />
      </View>
      <Text style={[successStyles.title, { color: colors.text }]}>Check Your Email</Text>
      <Text style={[successStyles.body, { color: colors.textSecondary }]}>
        We've sent a password reset link to your email address. Check your inbox and follow the instructions.
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[successStyles.backBtn, { borderColor: 'rgba(99,102,241,0.4)' }]}
      >
        <Text style={successStyles.backBtnText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}

const successStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: spacing.xxl },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xxl,
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  backBtnText: {
    ...typography.bodyBold,
    color: '#818CF8',
  },
})

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth()
  const { colors, isDark } = useTheme()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    setError('')
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    const result = await sendPasswordReset(email.trim())
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          {sent ? (
            <SuccessState colors={colors} />
          ) : (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)' }]}>
                <Ionicons name="key-outline" size={40} color="#818CF8" />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your email and we'll send you a reset link
              </Text>

              <View style={styles.form}>
                <ErrorMessage message={error} />
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
                <View style={styles.gap} />
                <AuthButton label="Send Reset Link" onPress={handleSend} loading={loading} />
              </View>
            </View>
          )}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 26,
  },
  form: { width: '100%' },
  gap: { height: spacing.md },
})
