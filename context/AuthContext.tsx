import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { blink } from '@/lib/blink'

type BlinkUser = Awaited<ReturnType<typeof blink.auth.me>>

interface AuthContextValue {
  user: BlinkUser | null
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
    const code = (error as any).code as string | undefined

    if (code) {
      if (code.includes('INVALID_CREDENTIALS') || code.includes('invalid_credentials')) {
        return 'Invalid email or password. Please try again.'
      }
      if (code.includes('EMAIL_ALREADY') || code.includes('email_already')) {
        return 'An account with this email already exists.'
      }
      if (code.includes('EMAIL_NOT_VERIFIED') || code.includes('not_verified')) {
        return 'Please verify your email before signing in.'
      }
      if (code.includes('WEAK_PASSWORD') || code.includes('weak_password')) {
        return 'Password is too weak. Use at least 8 characters.'
      }
      if (code.includes('RATE_LIMIT') || code.includes('rate_limit')) {
        return 'Too many attempts. Please try again later.'
      }
      if (code.includes('POPUP_CANCEL') || code.includes('popup_cancel')) {
        return 'Sign in was cancelled.'
      }
    }

    if (msg.includes('invalid') && (msg.includes('password') || msg.includes('credential'))) {
      return 'Invalid email or password. Please try again.'
    }
    if (msg.includes('already exists') || msg.includes('already registered')) {
      return 'An account with this email already exists.'
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Check your connection and try again.'
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return 'Too many attempts. Please try again later.'
    }

    return error.message || 'An unexpected error occurred.'
  }
  return 'An unexpected error occurred.'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BlinkUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user ?? null)
      setIsLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await blink.auth.signInWithEmail(email, password)
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      await blink.auth.signUp({ email, password, ...(displayName ? { displayName } : {}) })
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await blink.auth.signOut()
    } catch (_) {}
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await blink.auth.sendPasswordResetEmail(email)
      return {}
    } catch (err) {
      return { error: mapAuthError(err) }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
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
