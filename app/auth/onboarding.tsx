import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { AuthButton } from '@/components/auth/AuthButton'
import { spacing, typography, borderRadius } from '@/constants/design'

const { width } = Dimensions.get('window')
const ONBOARDING_KEY = 'onboarding_completed'

const SLIDES = [
  {
    id: '1',
    icon: 'timer-outline' as const,
    title: 'Pomodoro Technique',
    description:
      'Stay focused with 25-minute study sessions followed by short breaks to maximize your productivity.',
  },
  {
    id: '2',
    icon: 'bar-chart-outline' as const,
    title: 'Track Your Progress',
    description:
      'Monitor your study streaks, view detailed statistics, and celebrate your achievements.',
  },
  {
    id: '3',
    icon: 'settings-outline' as const,
    title: 'Customize Your Flow',
    description:
      'Personalize timer durations, themes, and notification settings to match your study style.',
  },
]

async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
  router.replace('/auth/signup')
}

function DotIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i === active && dotStyles.dotActive]}
        />
      ))}
    </View>
  )
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#6366F1',
  },
})

function OnboardingSlide({ item }: { item: typeof SLIDES[0] }) {
  return (
    <View style={slideStyles.container}>
      <View style={slideStyles.iconCircle}>
        <LinearGradient
          colors={['rgba(99,102,241,0.25)', 'rgba(59,130,246,0.15)']}
          style={slideStyles.iconGradient}
        >
          <Ionicons name={item.icon} size={72} color="#818CF8" />
        </LinearGradient>
      </View>
      <Text style={slideStyles.title}>{item.title}</Text>
      <Text style={slideStyles.description}>{item.description}</Text>
    </View>
  )
}

const slideStyles = StyleSheet.create({
  container: {
    width,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: 90,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  description: {
    ...typography.body,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
  },
})

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const isLast = activeIndex === SLIDES.length - 1

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  const handleNext = () => {
    if (isLast) {
      completeOnboarding()
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
    }
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OnboardingSlide item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.list}
        />

        <View style={styles.footer}>
          <DotIndicator count={SLIDES.length} active={activeIndex} />
          <View style={styles.gap} />
          <AuthButton
            label={isLast ? 'Get Started' : 'Next'}
            variant="primary"
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    ...typography.captionBold,
    color: '#64748B',
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  gap: { height: spacing.xl },
})
