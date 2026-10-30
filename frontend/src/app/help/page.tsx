'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  Search,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Mail,
  MessageSquare,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const faqs = [
  {
    q: 'How does the deepfake detection mechanism work?',
    a: 'Our system uses a 6-layer defense mechanism analyzing acoustics, speaker identity consistency, prosody, paralinguistics, semantics, and cryptographic watermarks to determine authenticity in real time.',
  },
  {
    q: 'What happens if a watermark is found?',
    a: 'If a cryptographic watermark is detected, the audio is immediately flagged as synthetic (Deepfake) regardless of how authentic it sounds, as the watermark is an undeniable signature of our generative engine.',
  },
  {
    q: 'How do I revoke a compromised API key?',
    a: 'Navigate to your Profile Settings › API Access. Click "Revoke Key" and immediately generate a new one. All active sessions using the old key will be terminated within seconds.',
  },
  {
    q: 'Are my analysis results stored permanently?',
    a: 'No. Analysis data is processed in memory and forensic reports are stored temporarily for 24 hours unless you explicitly save them to your account dashboard.',
  },
  {
    q: 'How does the WebSocket real-time streaming work?',
    a: 'Connect to ws://api/v1/verify/stream and send raw 16-bit PCM frames at 16kHz. Our VAD gates silence frames and runs the 4 fast analysis layers per speech window, pushing JSON verdicts back within milliseconds.',
  },
  {
    q: 'Can I clone any voice without consent?',
    a: 'No. VCaaS requires explicit consent verification for every voice clone. Users must speak a dynamically generated phrase, and all generated audio is permanently watermarked to the originating account.',
  },
]

const resources = [
  { icon: BookOpen, title: 'API Documentation', desc: 'Full REST & WebSocket API reference.', href: '/docs' },
  { icon: ShieldAlert, title: 'Security Center', desc: 'Report vulnerabilities or deepfake abuse.', href: '/security' },
  { icon: MessageSquare, title: 'Community Forum', desc: 'Discuss use-cases with other developers.', href: '#' },
  { icon: Zap, title: 'Quick-Start Guide', desc: 'Up and running in 5 minutes.', href: '/docs' },
]

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const filtered = faqs.filter(
    f =>
      !searchQuery ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] font-sans pb-24">
      {/* Hero */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--surface-1)] to-[var(--bg)] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)] opacity-[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] mb-8">
            <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)] tracking-wider uppercase">Support Center</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            How can we <span className="bg-gradient-to-r from-[var(--accent)] to-violet-400 bg-clip-text text-transparent">help you?</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[var(--text-2)] text-lg mb-10">
            Search docs, browse FAQs, or open a support ticket.
          </motion.p>

          <motion.div variants={fadeUp} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-3)]" />
            <input
              type="text"
              placeholder="Search documentation, FAQs, or security advisories…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-6 text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-lg"
            />
          </motion.div>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Quick Links */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="space-y-3"
        >
          <motion.h3 variants={fadeUp} className="text-lg font-semibold mb-6 px-2">Resources</motion.h3>
          {resources.map((r, i) => (
            <motion.a
              key={i}
              href={r.href}
              variants={fadeUp}
              className="group flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--surface-1)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer"
            >
              <div className="mt-1 p-2 bg-[var(--surface-2)] rounded-lg group-hover:bg-[var(--accent-bg)] transition-colors shrink-0">
                <r.icon className="w-5 h-5 text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-1)] group-hover:text-white transition-colors flex items-center gap-1.5">
                  {r.title}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </h4>
                <p className="text-xs text-[var(--text-2)] mt-1">{r.desc}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* FAQs + Contact */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            <motion.h3 variants={fadeUp} className="text-lg font-semibold mb-6">Frequently Asked Questions</motion.h3>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <motion.div variants={fadeUp} className="text-center py-10 text-[var(--text-3)]">
                  No results for "{searchQuery}"
                </motion.div>
              )}
              {filtered.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--border-strong)] transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-medium pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-3)] transition-transform shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-5 text-[var(--text-2)] text-sm leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="mt-12 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
              <Mail className="w-36 h-36" />
            </div>

            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-[var(--text-2)] text-sm mb-8 max-w-md">
              Create a support ticket and our security engineers will get back to you within 24 hours.
            </p>

            <form className="space-y-5 relative z-10" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-2)] ml-1">Email Address</label>
                  <input type="email" className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-2)] ml-1">Topic</label>
                  <select className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] appearance-none text-[var(--text-1)] transition-colors">
                    <option>Technical Integration</option>
                    <option>Billing &amp; Licensing</option>
                    <option>Report Deepfake Abuse</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-2)] ml-1">Message</label>
                <textarea rows={4} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] resize-none transition-colors" placeholder="Describe your issue in detail…" />
              </div>
              <button className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl text-sm font-medium transition-colors w-full md:w-auto flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Submit Ticket
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
