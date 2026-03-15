/**
 * FocusFlow – About Screen
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/context/ThemeContext'
import { spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design'

const FEATURES = [
  { icon: 'timer-outline', text: 'Pomodoro Timer with customizable durations' },
  { icon: 'bar-chart-outline', text: 'Study history and statistics' },
  { icon: 'flame-outline', text: 'Streak tracking system' },
  { icon: 'color-palette-outline', text: 'Beautiful dark/light themes' },
  { icon: 'notifications-outline', text: 'Notification reminders' },
]

const PLAY_STORE_URL = 'https://play.google.com/store/apps'

export default function AboutScreen() {
  const { colors } = useTheme()

  const openPlayStore = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {})
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About FocusFlow</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo & Title */}
        <View style={styles.heroSection}>
          <View style={[styles.logoWrap, { backgroundColor: colors.backgroundSecondary, ...shadows.md }]}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>FocusFlow</Text>
          <View style={[styles.versionBadge, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
            <Text style={[styles.versionText, { color: colors.primary }]}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.xs]}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            FocusFlow uses the proven Pomodoro Technique to help students and professionals maximize their productivity and focus.
          </Text>
        </View>

        {/* Features */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FEATURES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.xs]}>
          {FEATURES.map(({ icon, text }, i) => (
            <View
              key={i}
              style={[
                styles.featureRow,
                { borderBottomColor: colors.border },
                i === FEATURES.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
                <Ionicons name={icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
            </View>
          ))}
        </View>

        {/* Made with love */}
        <View style={styles.loveRow}>
          <Text style={[styles.loveText, { color: colors.textSecondary }]}>
            Made with{' '}
            <Text style={{ color: '#EF4444' }}>❤️</Text>
            {' '}for students everywhere
          </Text>
        </View>

        {/* Rate button */}
        <TouchableOpacity
          style={[styles.rateBtn, { backgroundColor: colors.primary }, shadows.sm]}
          onPress={openPlayStore}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-google-playstore" size={20} color="#fff" />
          <Text style={styles.rateBtnText}>Rate on Play Store</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h4, flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },

  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  logo: { width: 80, height: 80 },
  appName: { ...typography.h1 },
  versionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  versionText: { ...typography.small, fontWeight: '600' },

  card: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },

  description: {
    ...typography.body,
    lineHeight: 24,
    padding: spacing.lg,
    textAlign: 'center',
  },

  sectionLabel: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { ...typography.body, flex: 1 },

  loveRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loveText: { ...typography.caption },

  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    minHeight: 52,
  },
  rateBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
})
