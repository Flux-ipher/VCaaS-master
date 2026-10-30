'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import Logo from '@/components/common/Logo'

interface StrengthCheck {
  label: string
  pass: boolean
}

const getPasswordChecks = (password: string): StrengthCheck[] => [
  { label: 'At least 8 characters', pass: password.length >= 8 },
  { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
  { label: 'One number', pass: /[0-9]/.test(password) },
]

export default function SignupPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle, user, loading: authLoading, clearError } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const passwordChecks = getPasswordChecks(form.password)
  const passwordStrong = passwordChecks.every(c => c.pass)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (formError) setFormError('')
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address'
    }
    if (!passwordStrong) {
      errors.password = 'Password does not meet the requirements below'
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the Terms and Privacy Policy to continue'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFormError('')

    if (!validate()) return

    setSubmitting(true)
    try {
      const result = await signUpWithEmail(form.email.trim(), form.password, form.name.trim())
      if (result.success) {
        toast.success('Account created — welcome to VCaaS!')
        router.push('/dashboard')
      } else {
        setFormError(result.error || 'Sign-up failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    clearError()
    setFormError('')
    setGoogleSubmitting(true)
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        toast.success('Welcome to VCaaS!')
      } else {
        setFormError(result.error || 'Google sign-up failed.')
      }
    } finally {
      setGoogleSubmitting(false)
    }
  }

  const busy = submitting || googleSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <Link href="/" className="mb-6">
            <Logo size="lg" variant="icon-only" />
          </Link>
          <h1 className="text-3xl font-bold text-navy">Create your account</h1>
          <p className="mt-2 text-navy/60">Start licensing and protecting your voice</p>
        </div>

        <div className="glass-card rounded-2xl p-8 animate-slide-up">
          {formError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 p-3.5">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-error mt-0.5" />
              <p className="text-sm text-error">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy mb-1.5">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={busy}
                  placeholder="Jane Doe"
                  className={`input-glass w-full pl-10 pr-4 ${fieldErrors.name ? 'border-error focus:ring-error/30' : ''}`}
                />
              </div>
              {fieldErrors.name && <p className="mt-1.5 text-sm text-error">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={busy}
                  placeholder="you@example.com"
                  className={`input-glass w-full pl-10 pr-4 ${fieldErrors.email ? 'border-error focus:ring-error/30' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1.5 text-sm text-error">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={busy}
                  placeholder="Create a password"
                  className={`input-glass w-full pl-10 pr-10 ${fieldErrors.password ? 'border-error focus:ring-error/30' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map(check => (
                    <div key={check.label} className="flex items-center gap-1.5 text-xs">
                      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${check.pass ? 'bg-success/20' : 'bg-navy/10'}`}>
                        {check.pass && <CheckIcon className="h-2.5 w-2.5 text-success" />}
                      </span>
                      <span className={check.pass ? 'text-success' : 'text-navy/50'}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {fieldErrors.password && <p className="mt-1.5 text-sm text-error">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={busy}
                  placeholder="Re-enter your password"
                  className={`input-glass w-full pl-10 pr-10 ${fieldErrors.confirmPassword ? 'border-error focus:ring-error/30' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy/70 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1.5 text-sm text-error">{fieldErrors.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked)
                    if (fieldErrors.terms) setFieldErrors(prev => ({ ...prev, terms: '' }))
                  }}
                  disabled={busy}
                  className="mt-0.5 h-4 w-4 rounded border-glass-border text-berry-600 focus:ring-berry-400"
                />
                <span className="text-sm text-navy/70">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-berry-600 hover:text-berry-700">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="font-medium text-berry-600 hover:text-berry-700">Privacy Policy</Link>
                </span>
              </label>
              {fieldErrors.terms && <p className="mt-1.5 text-sm text-error">{fieldErrors.terms}</p>}
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="loading-spinner h-4 w-4" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white/60 px-3 text-navy/50 rounded-full">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={busy}
            className="glass-button w-full py-3 rounded-xl flex items-center justify-center gap-3 text-navy font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleSubmitting ? (
              <span className="loading-spinner h-4 w-4" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleSubmitting ? 'Creating account...' : 'Continue with Google'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-navy/60">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-berry-600 hover:text-berry-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
