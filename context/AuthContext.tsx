import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapAuthError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
      return 'Invalid email or password. Please try again.'
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'An account with this email already exists.'
    }
    if (msg.includes('email not confirmed')) {
      return 'Please verify your email before signing in.'
    }
    if (msg.includes('password should be at least')) {
      return 'Password is too weak. Use at least 6 characters.'
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Too many attempts. Please try again later.'
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Check your connection and try again.'
    }
    return error.message || 'An unexpected error occurred.'
  }
  return 'An unexpected error occurred.'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: mapAuthError(error) }
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: displayName ? { data: { display_name: displayName } } : undefined,
      })
      if (error) return { error: mapAuthError(error) }
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (_) {}
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) return { error: mapAuthError(error) }
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
