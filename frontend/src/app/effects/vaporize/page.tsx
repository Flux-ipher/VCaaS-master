'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Play,
  Pause,
  Upload,
  Wand2,
  Volume2,
  Waves,
  Radio,
  Zap,
  Wind,
  Music,
  RotateCcw,
  Download,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import VaporizeTextCycle, { Tag } from '@/components/VaporizeTextCycle'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

/* ─── Effect Definitions ─────────────────────────────────────── */
const EFFECTS = [
  {
    id: 'pitch-shift',
    icon: Music,
    label: 'Pitch Shift',
    desc: 'Raise or lower the fundamental frequency of the voice while preserving timing.',
    color: 'violet',
    param: { name: 'Semitones', min: -12, max: 12, default: 0, unit: 'st' },
  },
  {
    id: 'robotic',
    icon: Zap,
    label: 'Robotic Voice',
    desc: 'Vocoder-style synthesis that replaces formants with ring-modulated carriers.',
    color: 'sky',
    param: { name: 'Carrier Freq', min: 80, max: 400, default: 150, unit: 'Hz' },
  },
  {
    id: 'radio',
    icon: Radio,
    label: 'Radio Effect',
    desc: 'Band-pass filter with AM compression to simulate vintage radio transmissions.',
    color: 'amber',
    param: { name: 'Band width', min: 100, max: 4000, default: 2000, unit: 'Hz' },
  },
  {
    id: 'echo',
    icon: Waves,
    label: 'Echo / Reverb',
    desc: 'Multi-tap delay with high-frequency damping to create spatial depth.',
    color: 'emerald',
    param: { name: 'Room Size', min: 0, max: 100, default: 40, unit: '%' },
  },
  {
    id: 'whisper',
    icon: Wind,
    label: 'Whisper',
    desc: 'Aspirated noise injection to remove harmonic content and simulate whispering.',
    color: 'rose',
    param: { name: 'Noise Mix', min: 0, max: 100, default: 60, unit: '%' },
  },
  {
    id: 'deepen',
    icon: Volume2,
    label: 'Deepen',
    desc: 'Sub-harmonic synthesis to extend lower frequency content of the voice.',
    color: 'orange',
    param: { name: 'Sub Gain', min: 0, max: 100, default: 50, unit: 'dB' },
  },
]

const COLOR_MAP: Record<string, string> = {
  violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  sky: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
}
const RING_MAP: Record<string, string> = {
  violet: 'ring-violet-400/40',
  sky: 'ring-sky-400/40',
  amber: 'ring-amber-400/40',
  emerald: 'ring-emerald-400/40',
  rose: 'ring-rose-400/40',
  orange: 'ring-orange-400/40',
}

/* ─── Waveform Visualizer (pure CSS bars) ─────────────────────── */
function WaveformBars({ active, color }: { active: boolean; color: string }) {
  const barCount = 32
  return (
    <div className="flex items-center gap-[2px] h-10">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-[3px] rounded-full ${active ? `bg-${color}-400` : 'bg-[var(--border)]'}`}
          animate={active ? {
            height: [4, Math.random() * 28 + 8, 4],
          } : { height: 4 }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.02,
            ease: 'easeInOut',
          }}
          style={{ height: 4 }}
        />
      ))}
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function AudioEffectsPage() {
  const [selectedEffect, setSelectedEffect] = useState(EFFECTS[0])
  const [paramValue, setParamValue] = useState(EFFECTS[0].param.default)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleEffectSelect = useCallback((effect: typeof EFFECTS[0]) => {
    setSelectedEffect(effect)
    setParamValue(effect.param.default)
    setProcessed(false)
  }, [])

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('audio/')) {
      setAudioFile(f)
      setProcessed(false)
    }
  }

  const simulateProcess = async () => {
    if (!audioFile) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1800))
    setIsProcessing(false)
    setProcessed(true)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] font-sans pb-24 overflow-x-hidden">

      {/* ── Hero Section with Vaporize ── */}
      <section className="relative min-h-[420px] flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Animated background grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500 opacity-[0.06] blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-sky-500 opacity-[0.06] blur-[100px] rounded-full" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Wand2 className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-medium text-violet-400 tracking-wider uppercase">Audio Effects Studio</span>
          </motion.div>

          {/* Vaporize title */}
          <motion.div variants={fadeUp} className="mb-6">
            <VaporizeTextCycle
              texts={['Transform', 'Distort', 'Reimagine', 'Synthesize']}
              font={{ fontFamily: 'Inter, sans-serif', fontSize: '64px', fontWeight: 800 }}
              color="rgb(255,255,255)"
              spread={4}
              density={4}
              animation={{ vaporizeDuration: 1.8, fadeInDuration: 0.8, waitDuration: 1.2 }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.H1}
            />
            <p className="text-2xl font-light text-[var(--text-2)] mt-2">your voice with AI</p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[var(--text-2)] text-lg max-w-2xl mx-auto">
            Apply real-time acoustic transformations to any audio. Each effect is non-destructive —
            your original voice model stays untouched.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Studio Interface ── */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Effect Picker */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="lg:col-span-1 space-y-3"
          >
            <motion.h3 variants={fadeUp} className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider px-1 mb-4">
              Choose Effect
            </motion.h3>
            {EFFECTS.map((effect) => {
              const colors = COLOR_MAP[effect.color]
              const isActive = selectedEffect.id === effect.id
              return (
                <motion.button
                  key={effect.id}
                  variants={fadeUp}
                  onClick={() => handleEffectSelect(effect)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? `bg-[var(--surface-2)] border-[var(--border-strong)] ring-1 ${RING_MAP[effect.color]}`
                      : 'bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${colors}`}>
                    <effect.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{effect.label}</p>
                    <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{effect.desc.split('.')[0]}.</p>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-[var(--text-3)] ml-auto shrink-0" />}
                </motion.button>
              )
            })}
          </motion.div>

          {/* Studio Canvas */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="lg:col-span-2 space-y-6"
          >
            {/* Selected effect header */}
            <div className={`bg-[var(--surface-1)] border ${COLOR_MAP[selectedEffect.color].split(' ')[2]} border rounded-2xl p-6 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-40 h-40 opacity-[0.06] blur-[60px] rounded-full bg-${selectedEffect.color}-400`} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${COLOR_MAP[selectedEffect.color]}`}>
                    <selectedEffect.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedEffect.label}</h2>
                    <p className="text-sm text-[var(--text-2)]">{selectedEffect.desc}</p>
                  </div>
                </div>
              </div>

              {/* Parameter slider */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-[var(--text-3)] mb-2">
                  <span>{selectedEffect.param.name}</span>
                  <span className="font-mono">{paramValue} {selectedEffect.param.unit}</span>
                </div>
                <input
                  type="range"
                  min={selectedEffect.param.min}
                  max={selectedEffect.param.max}
                  value={paramValue}
                  onChange={e => { setParamValue(Number(e.target.value)); setProcessed(false) }}
                  className="w-full accent-current"
                  style={{ accentColor: `var(--accent)` }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1">
                  <span>{selectedEffect.param.min} {selectedEffect.param.unit}</span>
                  <span>{selectedEffect.param.max} {selectedEffect.param.unit}</span>
                </div>
              </div>

              {/* Waveform */}
              <div className="flex items-center justify-between">
                <WaveformBars active={isPlaying} color={selectedEffect.color} />
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setIsPlaying(p => !p)}
                    className={`p-3 rounded-xl border transition-all ${COLOR_MAP[selectedEffect.color]}`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Audio input */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-violet-400 bg-violet-400/5' : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setAudioFile(f); setProcessed(false) }
                }}
              />
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-[var(--surface-2)] rounded-xl flex items-center justify-center">
                    <Music className="w-5 h-5 text-[var(--text-2)]" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{audioFile.name}</p>
                    <p className="text-xs text-[var(--text-3)]">{(audioFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setAudioFile(null); setProcessed(false) }}
                    className="ml-4 p-1 hover:text-red-400 transition-colors text-[var(--text-3)]"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--text-3)]" />
                  <p className="font-medium mb-1">Drop an audio file here</p>
                  <p className="text-sm text-[var(--text-3)]">.wav · .mp3 · .m4a · .flac</p>
                </>
              )}
            </div>

            {/* Apply button */}
            <button
              onClick={simulateProcess}
              disabled={!audioFile || isProcessing}
              className="w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Applying {selectedEffect.label}…
                </>
              ) : processed ? (
                <>
                  <Download className="w-5 h-5" />
                  Download Processed Audio
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Apply {selectedEffect.label}
                </>
              )}
            </button>

            {/* Processing animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {['Analyzing waveform', 'Applying transformation', 'Rendering output', 'Encoding audio'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-3)] w-40 shrink-0">{step}</span>
                      <div className="flex-1 h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[var(--accent)] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: i * 0.35, duration: 0.9, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {processed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Effect Applied!</p>
                    <p className="text-xs text-emerald-400/70 mt-0.5">
                      {selectedEffect.label} processed at {paramValue} {selectedEffect.param.unit}. Ready to download.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Info Footer ── */}
      <section className="max-w-4xl mx-auto px-6 mt-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Wand2, title: 'Non-Destructive', desc: 'Effects are applied to an exported copy. Your original voice model is never modified.', color: 'violet' },
            { icon: Waves, title: 'Real-Time Preview', desc: 'Hear changes instantly as you adjust parameters before committing to export.', color: 'sky' },
            { icon: Zap, title: 'GPU Accelerated', desc: 'Server-side processing uses CUDA kernels for sub-second transformations on long files.', color: 'amber' },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${COLOR_MAP[item.color]}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
