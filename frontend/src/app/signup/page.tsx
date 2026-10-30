'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Input from '../../components/common/Input'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'
import AuthSuccessOverlay from '@/components/auth/AuthSuccessOverlay'

interface FormData {
  email: string
  username: string
  displayName: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authComplete, setAuthComplete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { signInWithGoogle, signUpWithEmail, user, loading: authLoading } = useAuth()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Signup attempt:', formData.email)
      const result = await signUpWithEmail(formData.email, formData.password, formData.displayName || formData.username)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Still keep local copy for immediate UI access if needed
      if (typeof window !== 'undefined') {
        localStorage.setItem('vcaas_user', JSON.stringify({
          name: formData.displayName || formData.username,
          email: formData.email,
          username: formData.username
        }))
      }
      setAuthComplete(true)
      setTimeout(() => router.push('/dashboard'), 1300)
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await signInWithGoogle()
      
      if (result.success) {
        console.log('Google sign-up successful:', result.user?.email)
      } else {
        setErrors({ submit: result.error || 'Google sign-up failed' })
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setErrors({ submit: 'An unexpected error occurred' })
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

  if (authComplete) return <AuthSuccessOverlay mode="signup" />

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 25, text: 'Weak', color: 'text-red-400', bg: 'bg-red-400' }
    if (password.length < 10) return { strength: 50, text: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-400' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 75, text: 'Good', color: 'text-blue-400', bg: 'bg-blue-400' }
    return { strength: 100, text: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-400' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white/10 border border-white/20 rounded-full p-4">
            <UserPlus className="h-6 w-6 text-[var(--text-1)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-1)]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-2)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-white hover:underline transition-all">
            Sign in here
          </Link>
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface)] py-8 px-4 border border-[var(--border)] sm:rounded-2xl sm:px-10 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">Registration Error</h3>
                    <div className="mt-1 text-sm text-red-400/80">
                      <p>{errors.submit}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
              autoComplete="username"
              placeholder="johndoe"
            />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-2)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border rounded-lg bg-black text-[var(--text-1)] placeholder:text-[var(--text-2)]/50 focus:outline-none focus:ring-1 transition-all ${
                    errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5' : 'border-[var(--border)] focus:border-white/30 focus:ring-white/30 hover:border-white/20'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.bg}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-12 ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-2)] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 border rounded-lg bg-black text-[var(--text-1)] placeholder:text-[var(--text-2)]/50 focus:outline-none focus:ring-1 transition-all ${
                    errors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5' : 'border-[var(--border)] focus:border-white/30 focus:ring-white/30 hover:border-white/20'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--text-2)] hover:text-white transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Passwords match</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="flex items-start">
                <input
                  id="agree-terms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 bg-black border-[var(--border)] rounded text-white focus:ring-white/30 focus:ring-1 mt-0.5"
                />
                <div className="ml-3">
                  <label htmlFor="agree-terms" className="text-sm text-[var(--text-2)]">
                    I agree to the{' '}
                    <Link href="/terms" className="text-white hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-white hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
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
                <span className="px-3 bg-[var(--surface)] text-[var(--text-2)]">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-[var(--border)] rounded-lg bg-black text-sm font-medium text-[var(--text-1)] hover:bg-white/5 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleGoogleSignUp}
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
