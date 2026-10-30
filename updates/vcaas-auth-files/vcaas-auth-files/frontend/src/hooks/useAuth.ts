import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import {
  auth,
  signInWithGoogle,
  signOutUser,
  isFirebaseInitialized,
  upsertUserProfile,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from '@/lib/firebase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized() || !auth) {
      console.warn('Authentication: Firebase not initialized (likely due to missing/invalid config).');
      setAuthState({
        user: null, // Set to null to treating as logged out
        loading: false,
        error: 'Firebase not configured'
      })
      return
    }

    // Failsafe timeout in case onAuthStateChanged hangs
    const timeoutId = setTimeout(() => {
      setAuthState(prev => {
        if (prev.loading) {
          console.warn('Authentication: Initialization timed out. Forcing completion.');
          return { ...prev, loading: false }
        }
        return prev
      })
    }, 5000) // 5 seconds timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeoutId)
      if (user) {
        await upsertUserProfile(user)
        try {
          const token = await user.getIdToken()
          const { syncUserProfile } = await import('@/lib/api')
          await syncUserProfile(user as any, token)
        } catch { }
      }
      setAuthState({
        user,
        loading: false,
        error: null
      })
    }, (error) => {
      clearTimeout(timeoutId)
      console.error('Authentication Error:', error)
      setAuthState({
        user: null,
        loading: false,
        error: error.message
      })
    })

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const signInWithGoogleHandler = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    let result: { success: boolean; user?: any; error?: string };
    if (!isFirebaseInitialized()) {
      // Use Mock Auth
      const { mockSignIn } = await import('@/lib/firebase');
      result = await mockSignIn();
    } else {
      // Use Real Auth
      result = await signInWithGoogle()
    }

    if (!result.success || !result.user) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: result.error || 'Sign-in failed'
      }))
    } else {
      setAuthState(prev => ({ ...prev, user: result.user, loading: false }))
      // Set API token
      try {
        const token = await result.user.getIdToken();
        const { setAuthToken } = await import('@/lib/api');
        setAuthToken(token);
        // Also sync profile for mock user to ensure backend DB record exists
        const { syncUserProfile } = await import('@/lib/api');
        await syncUserProfile(result.user as any, token);
      } catch (e) {
        console.error("Failed to set auth token or sync profile", e);
      }
    }

    return result
  }

  const signUpWithEmailHandler = async (email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    let result: { success: boolean; user?: any; error?: string }
    if (!isFirebaseInitialized()) {
      const { mockSignIn } = await import('@/lib/firebase')
      result = await mockSignIn()
    } else {
      result = await signUpWithEmail(email, password, displayName)
    }

    if (!result.success || !result.user) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Sign-up failed' }))
    } else {
      setAuthState(prev => ({ ...prev, user: result.user, loading: false }))
      try {
        const token = await result.user.getIdToken()
        const { setAuthToken, syncUserProfile } = await import('@/lib/api')
        setAuthToken(token)
        await syncUserProfile(result.user as any, token)
      } catch (e) {
        console.error('Failed to set auth token or sync profile', e)
      }
    }

    return result
  }

  const signInWithEmailHandler = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    let result: { success: boolean; user?: any; error?: string }
    if (!isFirebaseInitialized()) {
      const { mockSignIn } = await import('@/lib/firebase')
      result = await mockSignIn()
    } else {
      result = await signInWithEmail(email, password)
    }

    if (!result.success || !result.user) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Sign-in failed' }))
    } else {
      setAuthState(prev => ({ ...prev, user: result.user, loading: false }))
      try {
        const token = await result.user.getIdToken()
        const { setAuthToken, syncUserProfile } = await import('@/lib/api')
        setAuthToken(token)
        await syncUserProfile(result.user as any, token)
      } catch (e) {
        console.error('Failed to set auth token or sync profile', e)
      }
    }

    return result
  }

  const resetPasswordHandler = async (email: string) => {
    if (!isFirebaseInitialized()) {
      // No mock reset flow needed — surface a clear message in dev mode.
      return { success: false, error: 'Password reset is unavailable in demo mode.' }
    }
    return resetPassword(email)
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    let result: { success: boolean; error?: string };
    if (!isFirebaseInitialized()) {
      const { mockSignOut } = await import('@/lib/firebase');
      result = await mockSignOut();
    } else {
      const { signOutUser } = await import('@/lib/firebase');
      result = await signOutUser()
    }

    if (!result.success) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: result.error || 'Sign-out failed'
      }))
    } else {
      setAuthState(prev => ({ ...prev, user: null, loading: false }))
      const { setAuthToken } = await import('@/lib/api');
      setAuthToken(null);
    }

    return result
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle: signInWithGoogleHandler,
    signUpWithEmail: signUpWithEmailHandler,
    signInWithEmail: signInWithEmailHandler,
    resetPassword: resetPasswordHandler,
    signOut,
    clearError,
    isAuthenticated: !!authState.user
  }
}