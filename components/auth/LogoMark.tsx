import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

interface LogoMarkProps {
  size?: number
}

export function LogoMark({ size = 80 }: LogoMarkProps) {
  const iconSize = Math.round(size * 0.45)
  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient
        colors={['#6366F1', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        <Ionicons name="timer-outline" size={iconSize} color="#FFFFFF" />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
