'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'

interface AuthSuccessOverlayProps {
  mode: 'login' | 'signup'
}

export default function AuthSuccessOverlay({ mode }: AuthSuccessOverlayProps) {
  const title = mode === 'signup' ? 'Your space is ready' : 'Identity verified'
  const subtitle = mode === 'signup'
    ? 'Your secure creator workspace is being prepared.'
    : 'Your secure session has been established.'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#050507]/95 px-6 backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,54,93,0.16),transparent_42%)]" />
      <div className="relative flex max-w-sm flex-col items-center text-center">
        <div className="relative mb-8 h-28 w-28">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-[var(--accent-border)]"
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            className="absolute inset-3 flex items-center justify-center rounded-full bg-[var(--accent)] shadow-[0_0_50px_rgba(232,54,93,0.45)]"
          >
            <ShieldCheck className="h-12 w-12 text-white" strokeWidth={1.7} />
          </motion.div>
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring' }}
            className="absolute -right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#050507] bg-emerald-400 text-[#06120b]"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </motion.span>
        </div>

        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Secure access granted
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-1)]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-2)]">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
          className="mt-8 h-px max-w-[220px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
        />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 flex items-center gap-2 text-xs text-[var(--text-3)]">
          Opening dashboard <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)]" />
        </motion.p>
      </div>
    </motion.div>
  )
}
