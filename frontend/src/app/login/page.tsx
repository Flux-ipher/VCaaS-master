'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react'
import Input from '../../components/common/Input'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import AuthSuccessOverlay from '@/components/auth/AuthSuccessOverlay'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authComplete, setAuthComplete] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signInWithGoogle, signInWithEmail, user, loading: authLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signInWithEmail(formData.email, formData.password)

      if (!result.success) {
        // Map Firebase error codes to friendly messages
        let msg = result.error || ''
        if (typeof msg !== 'string') {
          msg = JSON.stringify(msg)
        }
        
        if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
          throw new Error('Incorrect email or password. Please try again.')
        } else if (msg.includes('too-many-requests')) {
          throw new Error('Too many failed attempts. Please wait a moment before trying again.')
        } else if (msg.includes('user-disabled')) {
          throw new Error('This account has been disabled. Please contact support.')
        } else {
          throw new Error(typeof result.error === 'string' ? result.error : 'Login failed. Please try again.')
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('vcaas_user', JSON.stringify({
          name: result.user?.displayName || formData.email,
          email: result.user?.email || formData.email,
        }))
      }
      setAuthComplete(true)
      setTimeout(() => router.push('/dashboard'), 1300)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        console.log('Google sign-in successful, waiting for auth state update...')
      } else {
        setError(result.error || 'Google sign-in failed')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setError('An unexpected error occurred during sign-in')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      setIsLoading(false)
      setAuthComplete(true)
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 1300)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  if (authComplete) return <AuthSuccessOverlay mode="login" />

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white/10 border border-white/20 rounded-full p-4">
            <Lock className="h-6 w-6 text-[var(--text-1)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-1)]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-2)]">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-white hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface)] py-8 px-4 border border-[var(--border)] sm:rounded-2xl sm:px-10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">Authentication Error</h3>
                    <div className="mt-1 text-sm text-red-400/80">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-black text-[var(--text-1)] placeholder:text-[var(--text-2)]/50 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 hover:border-white/20 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-black border-[var(--border)] rounded text-white focus:ring-white/30 focus:ring-1"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-2)]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[var(--text-2)] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[var(--surface)] text-[var(--text-2)]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-[var(--border)] rounded-lg bg-black text-sm font-medium text-[var(--text-1)] hover:bg-white/5 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleGoogleSignIn}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
