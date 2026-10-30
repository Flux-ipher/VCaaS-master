'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import Input from '../../components/common/Input'

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
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white/10 border border-white/20 rounded-full p-4">
            <KeyRound className="h-6 w-6 text-[var(--text-1)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-1)]">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--text-2)]">
          {sent ? "Check your inbox for a reset link" : "We'll email you a link to get back in"}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface)] py-8 px-4 border border-[var(--border)] sm:rounded-2xl sm:px-10 shadow-2xl">
          {sent ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-[var(--text-1)] mb-2">
                If an account exists for <span className="font-medium text-white">{email}</span>, a reset link is on its way.
              </p>
              <p className="text-sm text-[var(--text-2)] mb-8">
                Didn't get it? Check spam, or try again in a minute.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail('') }}
                className="w-full py-3 rounded-lg border border-[var(--border)] bg-black text-[var(--text-1)] hover:bg-white/5 hover:border-white/30 transition-all font-medium"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-red-400/80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-2)] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[var(--text-2)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                    disabled={submitting}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-black text-[var(--text-1)] placeholder:text-[var(--text-2)]/50 focus:outline-none focus:ring-1 transition-all ${
                      error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5' : 'border-[var(--border)] focus:border-white/30 focus:ring-white/30 hover:border-white/20'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-[var(--text-2)] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
