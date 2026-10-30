'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight,
  Mic,
  Shield,
  Zap,
  Code2,
  Play,
  Check,
  ChevronRight,
  AudioLines,
} from 'lucide-react'

/* ─────────────────────────────────────────────────
   Constants — defined outside component to prevent
   hydration mismatches from Math.random()
   ───────────────────────────────────────────────── */

/** Deterministic waveform bar heights using sine/cosine */
const WAVE_BARS = Array.from({ length: 52 }, (_, i) => {
  const t = i / 52
  const h =
    18 +
    Math.abs(Math.sin(t * Math.PI * 7)) * 42 +
    Math.abs(Math.cos(t * Math.PI * 4.3)) * 18
  return {
    height: Math.min(80, Math.max(8, h)),
    delay: t * 2.2,
    duration: 1.4 + Math.abs(Math.sin(i * 1.7)) * 0.8,
  }
})

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Cloning',
    description:
      'Upload 30 seconds of audio and generate a high-fidelity voice model. Supports XTTS v2 for near-human quality synthesis.',
    tag: 'Core',
  },
  {
    icon: Shield,
    title: 'Ethical Licensing',
    description:
      'Every clone is tied to a legal license. Track usage, set fine-grained permissions, revoke access, and earn royalties.',
    tag: 'Legal',
  },
  {
    icon: AudioLines,
    title: 'Deepfake Detection',
    description:
      'Six independent layers — acoustic artifacts, biometrics, prosody, emotion coherence, behavioral, and cryptographic — combine into one risk verdict.',
    tag: 'Security',
  },
  {
    icon: Zap,
    title: 'Real-Time Verification',
    description:
      'Stream live audio over WebSocket. Get a continuously updating authenticity score while the conversation is still happening — before decisions are made.',
    tag: 'Real-Time',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Upload voice samples',
    desc: 'Provide 15–120 seconds of clean, single-speaker audio. MP3, WAV, FLAC — we handle preprocessing.',
  },
  {
    n: '02',
    title: 'Train your model',
    desc: 'Our XTTS v2 pipeline fine-tunes a personalized voice model. Training completes in minutes, not hours.',
  },
  {
    n: '03',
    title: 'Clone & deploy',
    desc: 'Hit the API to synthesize any text in your voice. Every output carries a signed acoustic watermark.',
  },
]

const STATS = [
  { value: '25+',    label: 'Trained voices'      },
  { value: '6',      label: 'Detection layers'    },
  { value: '<2s',    label: 'Generation time'     },
  { value: '99.7%',  label: 'Watermark accuracy'  },
]

const TRUSTED_FEATURES = [
  'No subscription lock-in',
  'GDPR-compliant voice storage',
  'Open licensing model',
  'REST + WebSocket API',
  'Python & JS SDKs',
  'Async job queue',
]

/* ─────────────────────────────────────────────────
   Animation Variants
   ───────────────────────────────────────────────── */

const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
}

/* ─────────────────────────────────────────────────
   Reusable animated section wrapper
   ───────────────────────────────────────────────── */
function AnimSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─────────────────────────────────────────────────
   Waveform Visualizer
   ───────────────────────────────────────────────── */
function WaveformVisualizer() {
  return (
    <div
      className="flex items-center justify-center gap-[3px] py-2"
      style={{ height: 100, userSelect: 'none' }}
      aria-hidden="true"
    >
      {WAVE_BARS.map((bar, i) => {
        const isAccent = i % 8 === 0
        return (
          <motion.div
            key={i}
            style={{
              width: 2.5,
              borderRadius: 99,
              background: isAccent ? '#F59E0B' : '#0F172A',
              originY: 1,
            }}
            animate={{
              height: [bar.height * 0.2, bar.height, bar.height * 0.2],
              opacity: isAccent ? [0.6, 1, 0.6] : [0.35, 0.85, 0.35],
            }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              delay: bar.delay,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────
   Feature Card (Dark High-Contrast Card)
   ───────────────────────────────────────────────── */
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0]
  index: number
}) {
  const Icon = feature.icon
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="dark-feature-card flex flex-col cursor-default"
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={19} style={{ color: '#F59E0B' }} />
        </div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '2px 8px',
            borderRadius: 9999,
          }}
        >
          {feature.tag}
        </span>
      </div>

      <h3
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 18,
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.25,
          marginBottom: 6,
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#94A3B8',
          lineHeight: 1.5,
        }}
      >
        {feature.description}
      </p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────
   Step Card
   ───────────────────────────────────────────────── */
function StepCard({
  step,
  index,
  isLast,
}: {
  step: (typeof STEPS)[0]
  index: number
  isLast: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="flex gap-5 relative"
    >
      {/* Line connector */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 19,
            top: 48,
            bottom: -28,
            width: 1.5,
            background: '#E2E8F0',
          }}
        />
      )}

      {/* Number bubble */}
      <div
        style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: '#F8FAFC',
          border: '1.5px solid #0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          fontWeight: 600,
          color: '#0F172A',
        }}
      >
        {step.n}
      </div>

      <div style={{ paddingTop: 6, paddingBottom: 28 }}>
        <h3
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#0F172A',
            letterSpacing: '-0.015em',
            marginBottom: 6,
          }}
        >
          {step.title}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────
   Code Snippet
   ───────────────────────────────────────────────── */
function CodeSnippet() {
  const lines = [
    { t: 'comment', v: '# Synthesize text in any cloned voice' },
    { t: 'import',  v: 'import vcaas' },
    { t: 'blank',   v: '' },
    { t: 'code',    v: 'client = vcaas.Client(api_key="sk-...")' },
    { t: 'blank',   v: '' },
    { t: 'code',    v: 'audio = client.tts.synthesize(' },
    { t: 'param',   v: '  voice_id = "voice_creator_01",' },
    { t: 'param',   v: '  text     = "Voice Identity, Secured & Monetized.",' },
    { t: 'param',   v: '  watermark= True,' },
    { t: 'code',    v: ')' },
    { t: 'blank',   v: '' },
    { t: 'code',    v: 'audio.save("output.wav")' },
  ]

  const colorMap: Record<string, string> = {
    comment: '#64748B',
    import:  '#F59E0B',
    code:    '#F8FAFC',
    param:   '#CBD5E1',
    blank:   'transparent',
  }

  return (
    <div
      style={{
        background: '#0F172A',
        border: '1.5px solid #1E293B',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
      }}
    >
      {/* Dot decorations */}
      <div
        className="flex gap-2 mb-4"
        aria-hidden="true"
      >
        {['#EF4444','#F59E0B','#10B981'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: colorMap[line.t] ?? '#F8FAFC',
              minHeight: line.v ? undefined : 14,
            }}
          >
            {line.v}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────────────── */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 0.6], [0, -40])

  const [heroInView, setHeroInView] = React.useState(true)

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ══════════════════════════════════════════
          HERO
          ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* Background glow */}
        <div className="hero-glow" aria-hidden="true" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="container flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-8"
          >
            <span className="badge badge-accent">
              <span
                style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'pulse 2s ease-in-out infinite',
                  display: 'inline-block',
                }}
              />
              Voice Intelligence Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(44px, 5.5vw, 64px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: '#0F172A',
              maxWidth: 820,
              marginBottom: 20,
            }}
          >
            Voice Identity,{' '}
            <span style={{ color: '#F59E0B' }}>Secured</span> and<br />
            <span style={{ color: '#F59E0B' }}>Monetized</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(17px, 2vw, 19px)',
              color: '#475569',
              maxWidth: 640,
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            The first Voice Clone As A Service (VCaaS) infrastructure providing high-fidelity synthesis, cryptographic watermarking, and automated royalty licensing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <Link
              href="/docs"
              id="hero-cta-docs"
              className="btn btn-secondary"
              style={{
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 9999,
                border: '1.5px solid #0F172A',
                color: '#0F172A',
                background: 'transparent',
              }}
            >
              Read Documentation
            </Link>
            <Link
              href="/playground"
              id="hero-cta-sandbox"
              className="btn btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 9999,
                background: '#F59E0B',
                color: '#0F172A',
              }}
            >
              Initialize Sandbox
            </Link>
          </motion.div>

          {/* Waveform */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{ width: '100%', maxWidth: 640, marginBottom: 16 }}
          >
            <WaveformVisualizer />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
          ══════════════════════════════════════════ */}
      <AnimSection>
        <div
          className="container"
          style={{ paddingTop: 10, paddingBottom: 80 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 0,
              background: '#FFFFFF',
              border: '1.5px solid #0F172A',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                style={{
                  background: '#FFFFFF',
                  padding: '24px 20px',
                  textAlign: 'center',
                  borderRight: i < STATS.length - 1 ? '1.5px solid #0F172A' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(30px, 3.2vw, 38px)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    color: '#64748B',
                    fontWeight: 400,
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimSection>

      {/* ══════════════════════════════════════════
          FEATURES
          ══════════════════════════════════════════ */}
      <AnimSection>
        <div className="container" style={{ paddingBottom: 100 }}>
          {/* Section header */}
          <motion.div
            variants={fadeUp}
            className="mb-14 text-center max-w-xl mx-auto"
          >
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(32px, 4vw, 42px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#0F172A',
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              Everything you need to build with voice
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#64748B',
                lineHeight: 1.6,
              }}
            >
              A complete, unified infrastructure for voice synthesis, verified provenance, and creator licensing.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>
      </AnimSection>

      {/* ══════════════════════════════════════════
          HOW IT WORKS + CODE SNIPPET
          ══════════════════════════════════════════ */}
      <AnimSection>
        <div className="container" style={{ paddingBottom: 100 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 64,
              alignItems: 'start',
            }}
          >
            {/* Left — Steps */}
            <div>
              <motion.div variants={fadeUp} custom={0} className="mb-10">
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--accent)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  How it works
                </p>
                <h2
                  style={{
                    fontSize: 'clamp(26px, 3.5vw, 36px)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-1)',
                    lineHeight: 1.2,
                  }}
                >
                  From sample to production in minutes.
                </h2>
              </motion.div>

              <div>
                {STEPS.map((step, i) => (
                  <StepCard
                    key={step.n}
                    step={step}
                    index={i + 1}
                    isLast={i === STEPS.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Right — Code Snippet */}
            <motion.div variants={fadeUp} custom={1}>
              <CodeSnippet />
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  marginTop: 14,
                  textAlign: 'center',
                  letterSpacing: '0.01em',
                }}
              >
                Python SDK · REST API · WebSocket streaming
              </p>
            </motion.div>
          </div>
        </div>
      </AnimSection>

      {/* ══════════════════════════════════════════
          TRUST / CHECKLIST
          ══════════════════════════════════════════ */}
      <AnimSection>
        <div className="container" style={{ paddingBottom: 100 }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 20,
              padding: 'clamp(32px, 5vw, 56px)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 40,
                alignItems: 'center',
              }}
            >
              {/* Text */}
              <motion.div variants={fadeUp} custom={0}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#F59E0B',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  Built to trust
                </p>
                <h2
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(26px, 3.2vw, 36px)',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    lineHeight: 1.2,
                    marginBottom: 14,
                  }}
                >
                  Transparent, open, creator-first.
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>
                  We believe voice ownership belongs to the creator. Every feature
                  in VCaaS is designed to protect that.
                </p>
              </motion.div>

              {/* Checklist */}
              <motion.div
                variants={fadeUp}
                custom={1}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                {TRUSTED_FEATURES.map((item, i) => (
                  <motion.div
                    key={item}
                    variants={fadeIn}
                    custom={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      color: '#475569',
                    }}
                  >
                    <span
                      style={{
                        width: 20, height: 20,
                        borderRadius: '50%',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={11} color="#F59E0B" strokeWidth={2.5} />
                    </span>
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </AnimSection>

      {/* ══════════════════════════════════════════
          CTA
          ══════════════════════════════════════════ */}
      <AnimSection>
        <div className="container" style={{ paddingBottom: 120 }}>
          <motion.div
            variants={fadeUp}
            custom={0}
            style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto' }}
          >
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(30px, 4vw, 44px)',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: '#0F172A',
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Ready to build with voice?
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#64748B',
                lineHeight: 1.65,
                marginBottom: 36,
              }}
            >
              Start with a free sandbox account. No credit card required.
              Your first voice model is on us.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/signup"
                id="footer-cta-primary"
                className="btn btn-primary"
                style={{
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 500,
                  borderRadius: 9999,
                  background: '#F59E0B',
                  color: '#0F172A',
                }}
              >
                Create Free Account
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/docs"
                id="footer-cta-docs"
                className="btn btn-secondary"
                style={{
                  padding: '13px 28px',
                  fontSize: 15,
                  fontWeight: 500,
                  borderRadius: 9999,
                  border: '1.5px solid #0F172A',
                  color: '#0F172A',
                  background: 'transparent',
                }}
              >
                Read the Docs
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimSection>

    </div>
  )
}
