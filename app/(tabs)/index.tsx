/**
 * FocusFlow – Main Timer Screen
 * Pomodoro-style study timer with session management.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import CircularProgress from 'react-native-circular-progress-indicator'

import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useTimerStore, type SessionType } from '@/store/timerStore'
import { useStudySession } from '@/hooks/useStudySession'
import { spacing, typography, borderRadius, shadows } from '@/constants/design'

import TimerDisplay, { getSessionLabel } from '@/components/TimerDisplay'
import SessionCompleteModal from '@/components/SessionCompleteModal'
import DailyProgressCard from '@/components/DailyProgressCard'

// ─── Session Tab Config ──────────────────────────────────────────────────────

const SESSION_TABS: { type: SessionType; label: string }[] = [
  { type: 'focus',      label: 'Focus' },
  { type: 'shortBreak', label: 'Short Break' },
  { type: 'longBreak',  label: 'Long Break' },
]

// ─── Break color (green tint) for break modes ────────────────────────────────
const BREAK_COLOR = '#059669'

// ─── Component ───────────────────────────────────────────────────────────────

export default function TimerScreen() {
  const { colors, isDark } = useTheme()
  const { user } = useAuth()
  const { saveSession, updateStreak } = useStudySession()

  const {
    sessionType, isRunning, isPaused, timeRemaining, totalDuration,
    sessionsCompleted, longBreakInterval, focusDuration,
    startTimer, pauseTimer, resumeTimer, resetTimer, skipSession, setSessionType,
    tickTimer, completeSession,
  } = useTimerStore()

  const [showComplete, setShowComplete] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const didCompleteRef = useRef(false)

  // ── Timer interval logic ────────────────────────────────────────────────
  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      clearTick()
    }
    return clearTick
  }, [isRunning])

  // ── Detect session completion ────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning && !isPaused && timeRemaining === 0 && !didCompleteRef.current) {
      didCompleteRef.current = true
      handleSessionComplete()
    }
    // Reset guard when timer restarts
    if (isRunning) didCompleteRef.current = false
  }, [isRunning, isPaused, timeRemaining])

  const handleSessionComplete = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    // Only save focus sessions to DB
    if (sessionType === 'focus' && user?.id) {
      try {
        await saveSession(user.id, 'focus', focusDuration, new Date().toISOString())
        await updateStreak(user.id, focusDuration)
      } catch (_) {
        // non-blocking – handled by backend
      }
      setShowComplete(true)
    }
  }, [sessionType, user, focusDuration, saveSession, updateStreak])

  // ── Modal actions ────────────────────────────────────────────────────────
  const handleStartBreak = () => {
    setShowComplete(false)
    // completeSession() already set next session type in store
    startTimer()
  }

  const handleKeepGoing = () => {
    setShowComplete(false)
    // Reset to a fresh focus session
    setSessionType('focus')
  }

  // ── Tab switch ───────────────────────────────────────────────────────────
  const handleTabPress = (type: SessionType) => {
    if (type === sessionType) return
    setSessionType(type)
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync()
    }
  }

  // ── Play/pause control ───────────────────────────────────────────────────
  const handleMainButton = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    if (!isRunning && !isPaused) {
      startTimer()
    } else if (isRunning) {
      pauseTimer()
    } else {
      resumeTimer()
    }
  }

  const handleReset = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    resetTimer()
  }

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    skipSession()
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const progress = totalDuration > 0
    ? ((timeRemaining / totalDuration) * 100)
    : 100

  const isBreak = sessionType !== 'focus'
  const accentColor = isBreak ? BREAK_COLOR : colors.primary
  const trackColor = isDark ? colors.backgroundTertiary : '#E2E8F0'

  const sessionIndex = (sessionsCompleted % longBreakInterval) + 1

  const mainIconName = isRunning ? 'pause' : 'play'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.text }]}>FocusFlow</Text>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Session Tabs ────────────────────────────────────── */}
        <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary }]}>
          {SESSION_TABS.map(({ type, label }) => {
            const active = type === sessionType
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.tab,
                  active && { backgroundColor: accentColor },
                ]}
                onPress={() => handleTabPress(type)}
                activeOpacity={0.75}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? '#fff' : colors.textSecondary },
                    active && styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Circular Timer ──────────────────────────────────── */}
        <View style={styles.timerWrap}>
          <CircularProgress
            value={progress}
            radius={130}
            duration={950}
            progressValueColor={colors.text}
            activeStrokeColor={accentColor}
            inActiveStrokeColor={trackColor}
            activeStrokeWidth={10}
            inActiveStrokeWidth={10}
            showProgressValue={false}
            clockwise={false}
          />
          {/* Overlay the time display */}
          <TimerDisplay
            timeRemaining={timeRemaining}
            sessionType={sessionType}
            colors={colors}
          />
        </View>

        {/* ── Session Counter ─────────────────────────────────── */}
        <View style={styles.sessionCounter}>
          <View style={[styles.sessionDots]}>
            {Array.from({ length: longBreakInterval }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i < (sessionsCompleted % longBreakInterval)
                        ? accentColor
                        : trackColor,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
            Session {sessionIndex} of {longBreakInterval}
          </Text>
        </View>

        {/* ── Controls ────────────────────────────────────────── */}
        <View style={styles.controls}>
          {/* Reset */}
          <TouchableOpacity
            style={[styles.circleBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={handleReset}
            activeOpacity={0.75}
            accessibilityLabel="Reset timer"
          >
            <Ionicons name="refresh-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: accentColor },
              shadows.lg,
            ]}
            onPress={handleMainButton}
            activeOpacity={0.85}
            accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
          >
            <Ionicons name={mainIconName} size={32} color="#fff" />
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            style={[styles.circleBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={handleSkip}
            activeOpacity={0.75}
            accessibilityLabel="Skip session"
          >
            <Ionicons name="play-skip-forward-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Daily Progress ───────────────────────────────────── */}
        <DailyProgressCard
          sessionsCompleted={sessionsCompleted}
          colors={colors}
          isDark={isDark}
        />

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Completion Modal ─────────────────────────────────── */}
      <SessionCompleteModal
        visible={showComplete}
        focusDuration={focusDuration}
        colors={colors}
        isDark={isDark}
        onStartBreak={handleStartBreak}
        onKeepGoing={handleKeepGoing}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingTop: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  appTitle: {
    ...typography.h2,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Session Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  tabText: {
    ...typography.small,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {
    fontWeight: '700',
  },

  // Timer
  timerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    height: 280,
  },

  // Session counter
  sessionCounter: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  sessionLabel: {
    ...typography.small,
    fontWeight: '500',
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtn: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomPad: {
    height: spacing.xl,
  },
})
