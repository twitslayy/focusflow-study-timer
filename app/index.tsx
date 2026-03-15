import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/context/AuthContext'
import { LogoMark } from '@/components/auth/LogoMark'

const ONBOARDING_KEY = 'onboarding_completed'

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((val) => setOnboardingDone(val === 'true'))
      .catch(() => setOnboardingDone(false))
  }, [])

  // Still loading auth or onboarding check
  if (isLoading || onboardingDone === null) {
    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.loader}>
        <LogoMark size={80} />
        <ActivityIndicator color="#6366F1" size="large" style={styles.spinner} />
      </LinearGradient>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/splash" />
  }

  if (!onboardingDone) {
    return <Redirect href="/auth/onboarding" />
  }

  return <Redirect href="/(tabs)" />
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 32,
  },
})
