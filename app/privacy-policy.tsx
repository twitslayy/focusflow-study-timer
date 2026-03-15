/**
 * FocusFlow – Privacy Policy Screen
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/context/ThemeContext'
import { spacing, typography, borderRadius, shadows } from '@/constants/design'

// ─── Policy Sections ──────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect the following types of information when you use FocusFlow:

• **Account Information**: Your email address and display name when you create an account.
• **Usage Data**: Session types, durations, and timestamps of your study sessions.
• **Study Statistics**: Streak data, total focus time, and session counts to power your progress tracking.

We do not collect any sensitive personal information beyond what is necessary to provide the service.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `Your information is used solely to provide and improve the FocusFlow experience:

• **Personalization**: Displaying your stats, streaks, and history tailored to your account.
• **Progress Tracking**: Maintaining accurate records of your study sessions and achievements.
• **App Improvement**: Aggregated, anonymized usage patterns help us improve features.

We never sell your personal data to third parties.`,
  },
  {
    title: '3. Data Security',
    body: `We take data security seriously:

• All data is stored using encrypted storage provided by the Blink infrastructure.
• Data is transmitted over HTTPS / TLS.
• Access to user data is strictly controlled and limited to authorized personnel.
• Regular security audits are performed on our infrastructure.`,
  },
  {
    title: '4. Data Retention',
    body: `Your data is retained while your account remains active:

• Study sessions, streaks, and settings are stored as long as your account exists.
• You may request deletion of your data at any time by contacting us at support@focusflow.app.
• Upon account deletion, all associated data is permanently removed within 30 days.`,
  },
  {
    title: '5. Contact Us',
    body: `If you have any questions about this Privacy Policy or how we handle your data, please reach out:

📧 support@focusflow.app

We aim to respond to all privacy-related inquiries within 48 hours.`,
  },
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme()

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Privacy Policy</Text>
          <View style={[styles.dateBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>
              Last updated: March 2025
            </Text>
          </View>
        </View>

        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Your privacy matters to us. This policy explains how FocusFlow collects, uses, and protects your information.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
              {section.body}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            © 2025 FocusFlow. All rights reserved.
          </Text>
        </View>

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

  titleBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  pageTitle: { ...typography.h1 },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dateText: { ...typography.small, fontWeight: '500' },

  introCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  introText: { ...typography.body, lineHeight: 24 },

  sectionBlock: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    letterSpacing: -0.2,
  },
  sectionBody: {
    ...typography.body,
    lineHeight: 26,
  },

  footer: {
    marginHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  footerText: { ...typography.small },
})
