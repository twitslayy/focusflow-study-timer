/**
 * TimerDisplay
 * Overlay component rendered on top of CircularProgress.
 * Shows MM:SS time and session label.
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { typography, spacing } from '@/constants/design'
import type { SessionType } from '@/store/timerStore'
import type { ThemedColors } from '@/context/ThemeContext'

interface TimerDisplayProps {
  timeRemaining: number // seconds
  sessionType: SessionType
  colors: ThemedColors
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getSessionLabel(type: SessionType): string {
  switch (type) {
    case 'focus':      return 'Stay Focused'
    case 'shortBreak': return 'Short Break'
    case 'longBreak':  return 'Long Break'
  }
}

export default function TimerDisplay({ timeRemaining, sessionType, colors }: TimerDisplayProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={[styles.time, { color: colors.text }]}>
        {formatTime(timeRemaining)}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {getSessionLabel(sessionType)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: 60,
  },
  label: {
    ...typography.caption,
    fontWeight: '500',
    marginTop: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
