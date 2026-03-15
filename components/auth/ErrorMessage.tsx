import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, borderRadius, typography } from '@/constants/design'

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={16} color="#EF4444" style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...typography.caption,
    color: '#F87171',
    flex: 1,
  },
})
