/**
 * Settings redirect – navigates to the Settings tab
 */

import { useEffect } from 'react'
import { router } from 'expo-router'

export default function SettingsRedirect() {
  useEffect(() => {
    router.replace('/(tabs)/settings')
  }, [])
  return null
}
