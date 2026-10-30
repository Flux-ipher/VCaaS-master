import { useEffect, useState } from 'react'
import { onAuthStateChanged, sendPasswordResetEmail, User } from 'firebase/auth'
import { auth, signInWithGoogle, signOutUser, signUpWithEmail, signInWithEmail, isFirebaseInitialized, upsertUserProfile, mockSignIn, mockSignOut } from '@/lib/firebase'
import { syncUserProfile, setAuthToken, loginUser } from '@/lib/api'

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
      
      // Immediately set user and stop loading to prevent slow UI rendering
      setAuthState({
        user,
        loading: false,
        error: null
      })
      
      // Perform background syncing without blocking the UI
      if (user) {
        try {
          // Fire and forget (or await without blocking state)
          upsertUserProfile(user).catch(console.error)
          const token = await user.getIdToken()
          setAuthToken(token)
          syncUserProfile(user as any, token).catch(console.error)
        } catch (error) {
          console.error("Background sync failed:", error)
        }
      }
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
        setAuthToken(token);
        // Also sync profile for mock user to ensure backend DB record exists
        await syncUserProfile(result.user as any, token);
      } catch (e) {
        console.error("Failed to set auth token or sync profile", e);
      }
    }

    return result
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    let result: { success: boolean; error?: string };
    if (!isFirebaseInitialized()) {
      result = await mockSignOut();
    } else {
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
      setAuthToken(null);
    }

    return result
  }

  const signInWithEmailHandler = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    let result: any
    if (!isFirebaseInitialized()) {
      result = await mockSignIn()
    } else {
      result = await signInWithEmail(email, password)
    }

    if (!result.success || !result.user) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Sign-in failed' }))
    } else {
      setAuthState(prev => ({ ...prev, user: result.user, loading: false }))
      try {
        const token = await result.user.getIdToken();
        setAuthToken(token);
      } catch (e) {
        console.error("Failed to set auth token", e);
      }
    }
    return result
  }

  const signUpWithEmailHandler = async (email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    let result: any
    if (!isFirebaseInitialized()) {
      result = await mockSignIn()
    } else {
      result = await signUpWithEmail(email, password, displayName)
    }

    if (!result.success || !result.user) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Sign-up failed' }))
    } else {
      setAuthState(prev => ({ ...prev, user: result.user, loading: false }))
      // Set API token and sync profile with backend — same as Google/login handlers
      try {
        const token = await result.user.getIdToken()
        setAuthToken(token)
        await syncUserProfile(result.user as any, token)
      } catch (e) {
        console.error('Failed to set auth token or sync profile after signup', e)
      }
    }
    return result
  }

  const resetPasswordHandler = async (email: string) => {
    if (!isFirebaseInitialized() || !auth) {
      return { success: false, error: 'Firebase is not initialized' }
    }
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { success: false, error: error.message, code: error.code }
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle: signInWithGoogleHandler,
    signInWithEmail: signInWithEmailHandler,
    signUpWithEmail: signUpWithEmailHandler,
    resetPassword: resetPasswordHandler,
    signOut,
    clearError,
    isAuthenticated: !!authState.user
  }
}