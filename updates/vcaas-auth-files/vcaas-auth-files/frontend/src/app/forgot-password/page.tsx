'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  EnvelopeIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import Logo from '@/components/common/Logo'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      const result = await resetPassword(email.trim())
      if (result.success) {
        setSent(true)
      } else {
        setError(result.error || 'Could not send reset email. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <Link href="/" className="mb-6">
            <Logo size="lg" variant="icon-only" />
          </Link>
          <h1 className="text-3xl font-bold text-navy">Reset your password</h1>
          <p className="mt-2 text-navy/60">
            {sent ? "Check your inbox for a reset link" : "We'll email you a link to get back in"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 animate-slide-up">
          {sent ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-success" />
              </div>
              <p className="text-navy/80 mb-1">
                If an account exists for <span className="font-medium text-navy">{email}</span>, a reset link is on its way.
              </p>
              <p className="text-sm text-navy/50 mb-6">Didn&apos;t get it? Check spam, or try again in a minute.</p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail('') }}
                className="glass-button w-full py-2.5 rounded-xl text-navy font-medium"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/20 bg-error/10 p-3.5">
                  <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-error mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy/40" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                      disabled={submitting}
                      placeholder="you@example.com"
                      className={`input-glass w-full pl-10 pr-4 ${error ? 'border-error focus:ring-error/30' : ''}`}
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="loading-spinner h-4 w-4" />
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-navy/60 hover:text-berry-600 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
