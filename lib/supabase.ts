import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Hardcoded fallbacks ensure the build never fails even if env vars are undefined
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pkrkwvvkqnwciohuarnj.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcmt3dnZrcW53Y2lvaHVhcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjUyNTQsImV4cCI6MjA4OTI0MTI1NH0.376IIFPWzjvXZTopMTET3FFcAZnNcRES1p2Hf76ozH4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type { User, Session } from '@supabase/supabase-js'
