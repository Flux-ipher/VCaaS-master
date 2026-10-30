'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<any>
  clearError: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Loading component
export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <AuthLoadingScreen /> 
}) => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <>{fallback}</>
  }

  if (!user) {
    // Redirect to login or show login prompt
    window.location.href = '/login'
    return null
  }

  return <>{children}</>
}