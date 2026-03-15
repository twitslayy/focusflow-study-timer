import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { LogoMark } from '@/components/auth/LogoMark'
import { AuthButton } from '@/components/auth/AuthButton'
import { spacing, typography } from '@/constants/design'

const { height } = Dimensions.get('window')

function useFadeSlide(delay: number) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }))
  }, [])

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
}

export default function SplashScreen() {
  const logoAnim = useFadeSlide(100)
  const titleAnim = useFadeSlide(350)
  const taglineAnim = useFadeSlide(550)
  const buttonsAnim = useFadeSlide(750)

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.heroSection}>
            <Animated.View style={[styles.logoWrap, logoAnim]}>
              <LogoMark size={120} />
            </Animated.View>

            <Animated.View style={[styles.titleWrap, titleAnim]}>
              <Text style={styles.appName}>FocusFlow</Text>
            </Animated.View>

            <Animated.View style={taglineAnim}>
              <Text style={styles.tagline}>Master Your Focus.{'\n'}Own Your Time.</Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.buttonsSection, buttonsAnim]}>
            <AuthButton
              label="Get Started"
              variant="primary"
              onPress={() => router.push('/auth/onboarding')}
            />
            <View style={styles.gap} />
            <AuthButton
              label="Sign In"
              variant="outline"
              onPress={() => router.push('/auth/login')}
            />
          </Animated.View>

          <Animated.View style={[styles.footer, buttonsAnim]}>
            <Text style={styles.footerText}>
              Boost your productivity with the Pomodoro Technique
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.05,
  },
  logoWrap: {
    marginBottom: spacing.xl,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  titleWrap: {
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
  },
  tagline: {
    ...typography.h3,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 32,
  },
  buttonsSection: {
    width: '100%',
  },
  gap: {
    height: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...typography.small,
    color: '#475569',
    textAlign: 'center',
  },
})
