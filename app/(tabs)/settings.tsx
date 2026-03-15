/**
 * FocusFlow – Settings Screen
 * Timer, appearance, notifications, and about settings.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { useTheme, type ThemeMode, type AccentColor } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { useSettings, type UserSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings'
import { useTimerStore } from '@/store/timerStore'
import { spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design'

// ─── Accent Palette ───────────────────────────────────────────────────────────

const ACCENT_OPTIONS: { key: AccentColor; color: string; label: string }[] = [
  { key: 'blue',   color: '#2563EB', label: 'Blue' },
  { key: 'purple', color: '#7C3AED', label: 'Purple' },
  { key: 'green',  color: '#059669', label: 'Green' },
  { key: 'orange', color: '#EA580C', label: 'Orange' },
]

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: 'light',  label: 'Light',  icon: 'sunny-outline' },
  { key: 'dark',   label: 'Dark',   icon: 'moon-outline' },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
]

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme()
  return (
    <Text style={[sectionStyles.header, { color: colors.textSecondary }]}>{title}</Text>
  )
}

const sectionStyles = StyleSheet.create({
  header: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
})

// ─── Stepper Row ──────────────────────────────────────────────────────────────

interface StepperRowProps {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChangeValue: (v: number) => void
  isLast?: boolean
}

function StepperRow({ label, value, min, max, unit = 'min', onChangeValue, isLast }: StepperRowProps) {
  const { colors } = useTheme()

  const decrement = () => {
    if (value > min) {
      if (Platform.OS !== 'web') Haptics.selectionAsync()
      onChangeValue(value - 1)
    }
  }
  const increment = () => {
    if (value < max) {
      if (Platform.OS !== 'web') Haptics.selectionAsync()
      onChangeValue(value + 1)
    }
  }

  return (
    <View
      style={[
        rowStyles.row,
        { borderBottomColor: colors.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={[rowStyles.label, { color: colors.text }]}>{label}</Text>
      <View style={rowStyles.stepper}>
        <TouchableOpacity
          style={[rowStyles.stepBtn, { backgroundColor: colors.backgroundSecondary, opacity: value <= min ? 0.4 : 1 }]}
          onPress={decrement}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="remove" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={[rowStyles.stepValue, { color: colors.text }]}>
          {value}
          <Text style={[rowStyles.stepUnit, { color: colors.textSecondary }]}> {unit}</Text>
        </Text>
        <TouchableOpacity
          style={[rowStyles.stepBtn, { backgroundColor: colors.backgroundSecondary, opacity: value >= max ? 0.4 : 1 }]}
          onPress={increment}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { ...typography.body },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    ...typography.bodyBold,
    minWidth: 52,
    textAlign: 'center',
  },
  stepUnit: {
    ...typography.caption,
    fontWeight: '400',
  },
})

// ─── Toggle Row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string
  sublabel?: string
  value: boolean
  onValueChange: (v: boolean) => void
  isLast?: boolean
}

function ToggleRow({ label, sublabel, value, onValueChange, isLast }: ToggleRowProps) {
  const { colors } = useTheme()

  const handleChange = (v: boolean) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync()
    onValueChange(v)
  }

  return (
    <View
      style={[
        toggleStyles.row,
        { borderBottomColor: colors.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={toggleStyles.labelWrap}>
        <Text style={[toggleStyles.label, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[toggleStyles.sublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: withOpacity(colors.textTertiary, 0.3), true: colors.primary }}
        thumbColor={Platform.OS === 'android' ? (value ? colors.primaryLight : colors.textTertiary) : '#fff'}
        ios_backgroundColor={withOpacity(colors.textTertiary, 0.3)}
      />
    </View>
  )
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  labelWrap: { flex: 1 },
  label: { ...typography.body },
  sublabel: { ...typography.small, marginTop: 2 },
})

// ─── Nav Row ──────────────────────────────────────────────────────────────────

interface NavRowProps {
  label: string
  sublabel?: string
  onPress: () => void
  isLast?: boolean
}

function NavRow({ label, sublabel, onPress, isLast }: NavRowProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[
        navStyles.row,
        { borderBottomColor: colors.border },
        isLast && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={navStyles.labelWrap}>
        <Text style={[navStyles.label, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[navStyles.sublabel, { color: colors.textSecondary }]}>{sublabel}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  )
}

const navStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  labelWrap: { flex: 1 },
  label: { ...typography.body },
  sublabel: { ...typography.small, marginTop: 2 },
})

// ─── Section Card Wrapper ─────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        cardStyles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadows.xs,
      ]}
    >
      {children}
    </View>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
})

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, themeMode, accentColor, setThemeMode, setAccentColor } = useTheme()
  const { user } = useAuth()
  const { loadSettings, saveSettings } = useSettings()
  const updateTimerSettings = useTimerStore((s) => s.updateSettings)

  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS })
  const [isLoading, setIsLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load settings on mount
  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return }
    loadSettings(user.id).then((s) => {
      setSettings(s)
      setIsLoading(false)
    })
  }, [user?.id])

  // Debounced save
  const persist = useCallback(
    (partial: Partial<UserSettings>) => {
      if (!user?.id) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        saveSettings(user.id!, partial)
      }, 500)
    },
    [user?.id, saveSettings],
  )

  const update = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        persist({ [key]: value })
        // Sync timer store for duration settings
        if (key === 'focusDuration' || key === 'shortBreakDuration' || key === 'longBreakDuration' || key === 'longBreakInterval') {
          updateTimerSettings({ [key]: value } as any)
        }
        return next
      })
    },
    [persist, updateTimerSettings],
  )

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
    update('themeMode', mode)
  }

  const handleAccentChange = (color: AccentColor) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync()
    setAccentColor(color)
    update('accentColor', color)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* ── Timer Settings ───────────────────────────────────── */}
        <SectionHeader title="Timer Settings" />
        <SectionCard>
          <StepperRow
            label="Focus Duration"
            value={settings.focusDuration}
            min={15} max={60}
            onChangeValue={(v) => update('focusDuration', v)}
          />
          <StepperRow
            label="Short Break"
            value={settings.shortBreakDuration}
            min={1} max={15}
            onChangeValue={(v) => update('shortBreakDuration', v)}
          />
          <StepperRow
            label="Long Break"
            value={settings.longBreakDuration}
            min={5} max={30}
            onChangeValue={(v) => update('longBreakDuration', v)}
          />
          <StepperRow
            label="Long Break After"
            value={settings.longBreakInterval}
            min={2} max={8}
            unit="sessions"
            onChangeValue={(v) => update('longBreakInterval', v)}
            isLast
          />
        </SectionCard>

        {/* ── Appearance ───────────────────────────────────────── */}
        <SectionHeader title="Appearance" />
        <SectionCard>
          {/* Theme pills */}
          <View style={[styles.appearanceRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
            <View style={[styles.themePills, { backgroundColor: colors.backgroundSecondary }]}>
              {THEME_OPTIONS.map(({ key, label, icon }) => {
                const active = themeMode === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.themePill,
                      active && { backgroundColor: colors.surface, ...shadows.xs },
                    ]}
                    onPress={() => handleThemeChange(key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={icon as any}
                      size={14}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themePillText,
                        { color: active ? colors.primary : colors.textSecondary },
                        active && { fontWeight: '700' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Accent color circles */}
          <View style={[styles.appearanceRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Accent Color</Text>
            <View style={styles.accentRow}>
              {ACCENT_OPTIONS.map(({ key, color, label }) => {
                const active = accentColor === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.accentCircle,
                      { backgroundColor: color },
                      active && styles.accentCircleActive,
                    ]}
                    onPress={() => handleAccentChange(key)}
                    activeOpacity={0.8}
                    accessibilityLabel={`${label} accent`}
                  >
                    {active && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </SectionCard>

        {/* ── Notifications ────────────────────────────────────── */}
        <SectionHeader title="Notifications" />
        <SectionCard>
          <ToggleRow
            label="Notification Sound"
            sublabel="Play a sound when session ends"
            value={settings.notificationSound}
            onValueChange={(v) => update('notificationSound', v)}
          />
          <ToggleRow
            label="Auto-start Breaks"
            sublabel="Automatically start break timer"
            value={settings.autoStartBreaks}
            onValueChange={(v) => update('autoStartBreaks', v)}
          />
          <ToggleRow
            label="Auto-start Focus"
            sublabel="Automatically start next focus session"
            value={settings.autoStartFocus}
            onValueChange={(v) => update('autoStartFocus', v)}
          />
          <StepperRow
            label="Daily Goal"
            value={settings.dailyGoalSessions}
            min={1} max={20}
            unit="sessions"
            onChangeValue={(v) => update('dailyGoalSessions', v)}
            isLast
          />
        </SectionCard>

        {/* ── About ───────────────────────────────────────────── */}
        <SectionHeader title="About" />
        <SectionCard>
          <NavRow label="About FocusFlow" onPress={() => router.push('/about')} />
          <NavRow label="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
          <NavRow
            label="App Version"
            sublabel="1.0.0"
            onPress={() => {}}
            isLast
          />
        </SectionCard>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2 },

  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rowLabel: { ...typography.body, flex: 1 },

  themePills: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    padding: 3,
    gap: 0,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    minHeight: 32,
  },
  themePillText: {
    ...typography.small,
    fontWeight: '500',
  },

  accentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  accentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentCircleActive: {
    ...shadows.sm,
    transform: [{ scale: 1.15 }],
  },
})
