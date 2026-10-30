'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Shield, Key, ArrowRight, Sparkles, Building2, Cpu } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.12 } } }

const plans = [
  {
    name: 'Starter',
    icon: Sparkles,
    desc: 'For individual researchers and small projects.',
    monthlyPrice: 0,
    annualPrice: 0,
    period: 'Forever Free',
    features: [
      '1,000 API calls / month',
      'Standard latency',
      'Watermark detection only',
      'Community support',
    ],
    missing: ['Speaker verification', 'Prosody analysis', 'SLA guarantee'],
    cta: 'Current Plan',
    ctaHref: '/dashboard',
    primary: false,
    accentClass: 'border-[var(--border)]',
  },
  {
    name: 'Pro',
    icon: Cpu,
    desc: 'For growing teams and commercial applications.',
    monthlyPrice: 59,
    annualPrice: 49,
    period: 'per user / month',
    features: [
      '50,000 API calls / month',
      'Low latency (<200ms)',
      'Full 6-layer deepfake analysis',
      'Speaker verification module',
      'Priority email support',
    ],
    missing: ['On-premise deployment'],
    cta: 'Upgrade to Pro',
    ctaHref: '/billing',
    primary: true,
    accentClass: 'border-2 border-[var(--accent-border)] shadow-[0_0_40px_rgba(232,54,93,0.12)]',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    desc: 'For military, government, and high-volume platforms.',
    monthlyPrice: null,
    annualPrice: null,
    period: 'Contact us',
    features: [
      'Unlimited API calls',
      'Ultra-low latency (<50ms)',
      'Custom acoustic models',
      'On-premise deployment option',
      '24/7 dedicated support',
      'Custom SLA guarantee',
    ],
    missing: [],
    cta: 'Contact Sales',
    ctaHref: '/help',
    primary: false,
    accentClass: 'border-[var(--border)]',
  },
]

export default function Licensing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] font-sans pb-24">
      {/* Hero */}
      <section className="pt-24 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent)] opacity-[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] mb-8">
            <Shield className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)] tracking-wider uppercase">Transparent Pricing</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Simple,{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] to-violet-400 bg-clip-text text-transparent">
              transparent
            </span>{' '}
            pricing
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[var(--text-2)] text-lg mb-10">
            Scale your deepfake defense infrastructure without hidden fees. All plans include our
            core cryptographic watermark verification.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div variants={fadeUp} className="inline-flex items-center p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-full">
            {(['monthly', 'annual'] as const).map(cycle => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billing === cycle
                    ? 'bg-[var(--surface-3)] text-white shadow-sm border border-[var(--border-strong)]'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {cycle === 'monthly' ? 'Monthly' : (
                  <>Annual <span className="text-[var(--accent)] ml-1 text-xs">Save 20%</span></>
                )}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => {
            const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice
            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative rounded-3xl p-8 flex flex-col bg-[var(--surface-1)] ${plan.accentClass} ${plan.primary ? 'bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)]' : ''}`}
              >
                {plan.primary && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-[var(--accent)] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">Most Popular</span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-12 h-12 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-[var(--text-2)]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-2)] min-h-[40px]">{plan.desc}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    {price !== null ? (
                      <>
                        <span className="text-2xl text-[var(--text-2)] font-medium">$</span>
                        <span className="text-6xl font-bold tracking-tight">{price}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
                    )}
                  </div>
                  <p className="text-[var(--text-2)] text-sm mt-1">{plan.period}</p>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 rounded-xl font-medium transition-all mb-8 text-center flex items-center justify-center gap-2 group ${
                    plan.primary
                      ? 'bg-[var(--text-1)] text-black hover:bg-gray-200'
                      : 'bg-transparent border border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div className="space-y-4 flex-1">
                  <p className="text-xs font-bold text-[var(--text-1)] tracking-wider uppercase mb-4">Includes</p>
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-[var(--text-1)]">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(m => (
                    <div key={m} className="flex items-start gap-3 opacity-35">
                      <X className="w-4 h-4 text-[var(--text-3)] mt-0.5 shrink-0" />
                      <span className="text-sm text-[var(--text-3)]">{m}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* License Status Banner */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
            <Key className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="text-lg font-semibold">Your Current License</h3>
            </div>
            <p className="text-[var(--text-2)] text-sm">
              You are currently on the <span className="text-[var(--text-1)] font-medium">Free Tier</span>. You have used 450 / 1,000 API calls this month.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-56">
            <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-[var(--accent)] rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: '45%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-3)] font-mono">
              <span>450 used</span>
              <span>45%</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12">Full Feature Comparison</motion.h2>

          <motion.div variants={fadeUp} className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {[
              ['API Calls / month', '1,000', '50,000', 'Unlimited'],
              ['Latency', 'Standard', '<200ms', '<50ms'],
              ['Watermark Detection', '✓', '✓', '✓'],
              ['6-Layer Analysis', '—', '✓', '✓'],
              ['Speaker Verification', '—', '✓', '✓'],
              ['Real-Time Streaming', '—', '✓', '✓'],
              ['On-Premise Deploy', '—', '—', '✓'],
              ['SLA Guarantee', '—', '—', '✓'],
              ['Support', 'Community', 'Priority Email', '24/7 Dedicated'],
            ].map(([feature, starter, pro, enterprise], idx) => (
              <div key={idx} className={`grid grid-cols-4 px-6 py-4 text-sm ${idx % 2 === 0 ? 'bg-[var(--surface-2)]/30' : ''} ${idx === 0 ? 'font-semibold text-[var(--text-2)] text-xs uppercase tracking-wider border-b border-[var(--border)]' : ''}`}>
                <span className="text-[var(--text-1)]">{feature}</span>
                <span className="text-center text-[var(--text-2)]">{starter}</span>
                <span className="text-center text-[var(--accent)] font-medium">{pro}</span>
                <span className="text-center text-[var(--text-2)]">{enterprise}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
