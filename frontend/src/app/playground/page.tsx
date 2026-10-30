'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  PlayCircle,
  Pause,
  Download,
  Upload,
  Mic,
  Settings,
  Wand2,
  Copy,
  RotateCcw,
  Zap,
  CheckCircle2
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PlaygroundPage() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('xtts-default')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 0,
    volume: 0.8,
    emotion: 'neutral'
  })
  const [language, setLanguage] = useState('en')
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [addWatermark, setAddWatermark] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [voices, setVoices] = useState<any[]>([
    { id: 'xtts-default', name: 'XTTS v2 (Zero-shot)', type: 'System', status: 'Ready' },
  ])

  React.useEffect(() => {
    const fetchVoices = async () => {
      try {
        const { getAvailableVoices } = await import('@/lib/api')
        const models = await getAvailableVoices()
        if (Array.isArray(models)) {
          const mappedModels = models.map((m: any) => ({
            id: m.id,
            name: m.name,
            type: 'System',
            status: m.status === 'ready' ? 'Ready' : 'Unavailable'
          }))
          // Ensure XTTS is always there as a fallback
          if (!mappedModels.find(m => m.id === 'xtts-default')) {
            mappedModels.unshift({ id: 'xtts-default', name: 'XTTS v2 (Zero-shot)', type: 'System', status: 'Ready' })
          }
          setVoices(mappedModels)
        }
      } catch (err) {
        console.error('Failed to fetch voices:', err)
      }
    }
    fetchVoices()
  }, [])

  const sampleTexts = [
    "Welcome to VCaaS, where your voice becomes a powerful creative tool.",
    "The future of voice technology is here, and it's ethical, traceable, and creator-first.",
    "Transform any text into speech with professional-quality voice cloning.",
    "Create, license, and monetize your unique voice with confidence."
  ]

  const handleGenerate = async () => {
    if (!text.trim()) return
    if (!referenceFile) { alert('Please upload a reference voice sample (wav/mp3/m4a/flac).'); return }
    setIsGenerating(true)
    setGeneratedAudio(null)
    try {
      const { cloneZeroShot } = await import('@/lib/api')
      const blob = await cloneZeroShot(text, language, referenceFile, addWatermark)
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'audio/wav' }))
      setGeneratedAudio(blobUrl)
    } catch (error: any) {
      console.error('Generation failed:', error)
      alert(error.message || 'Failed to generate audio. Check backend logs.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const onPickFile = () => fileInputRef.current?.click()
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null
    setReferenceFile(f)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-[var(--text-1)] tracking-tight mb-2">
              Voice Playground 🎭
            </h1>
            <p className="text-[var(--text-2)]">
              Test your voice clones and experiment with different settings instantly.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Playground */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-[var(--text-1)] mb-4">Text to Speech</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                  Enter your text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste the text you want to convert to speech..."
                  className="w-full h-36 bg-black border border-[var(--border)] text-[var(--text-1)] rounded-lg p-4 resize-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all placeholder:text-[var(--text-2)]/50"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-[var(--text-2)] font-mono">{text.length}/1000</p>
                  <button
                    onClick={() => setText('')}
                    className="text-xs text-[var(--text-2)] hover:text-white flex items-center space-x-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Sample Text Buttons */}
              <div className="mb-8">
                <p className="text-sm font-medium text-[var(--text-2)] mb-3">Quick samples:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setText(sample)}
                      className="text-xs px-3 py-1.5 border border-[var(--border)] hover:border-white/30 hover:bg-white/5 rounded-full text-[var(--text-2)] hover:text-white transition-all"
                    >
                      Sample {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference + Language */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Reference voice</label>
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} onChange={onFileChange} type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" className="hidden" />
                    <button 
                      onClick={onPickFile} 
                      className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                        referenceFile 
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                          : 'border-[var(--border)] bg-black text-[var(--text-1)] hover:border-white/30'
                      }`}
                    >
                      {referenceFile ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4 text-[var(--text-2)]" />}
                      <span className="truncate max-w-[150px]">{referenceFile ? referenceFile.name : 'Upload sample'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-black border border-[var(--border)] text-[var(--text-1)] text-sm rounded-lg focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || !referenceFile || isGenerating}
                className="w-full bg-white text-black hover:bg-gray-200 py-3.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Generating Speech...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Audio Player */}
            {generatedAudio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--text-1)] mb-4">Generated Audio</h3>

                <div className="bg-black border border-[var(--border)] rounded-lg p-6 mb-4">
                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center mb-6 h-12 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full ${isPlaying ? 'bg-white animate-pulse' : 'bg-white/20'}`}
                        style={{
                          height: `${Math.max(10, Math.random() * 100)}%`,
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handlePlay}
                      className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <PlayCircle className="w-6 h-6 fill-current ml-1" />}
                    </button>

                    <button className="px-4 py-2 border border-[var(--border)] hover:bg-white/5 rounded-lg flex items-center space-x-2 text-[var(--text-1)] text-sm font-medium transition-colors">
                      <Download className="w-4 h-4 text-[var(--text-2)]" />
                      <span>Download</span>
                    </button>

                    <button className="px-4 py-2 border border-[var(--border)] hover:bg-white/5 rounded-lg flex items-center space-x-2 text-[var(--text-1)] text-sm font-medium transition-colors">
                      <Copy className="w-4 h-4 text-[var(--text-2)]" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <audio ref={audioRef} src={generatedAudio} onEnded={() => setIsPlaying(false)} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-1)] mb-4">Voice Selection</h3>

              <div className="space-y-3">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedVoice === voice.id
                        ? 'border-white/40 bg-white/5'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-1)] text-sm">{voice.name}</p>
                        <p className="text-xs text-[var(--text-2)]">{voice.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        voice.status === 'Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {voice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Voice Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-1)] mb-5 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-[var(--text-2)]" />
                <span>Voice Settings</span>
              </h3>

              <div className="space-y-5">
                {/* Speed */}
                <div>
                  <label className="flex justify-between text-sm font-medium text-[var(--text-2)] mb-2">
                    <span>Speed</span>
                    <span className="text-[var(--text-1)]">{voiceSettings.speed}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                    className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Pitch */}
                <div>
                  <label className="flex justify-between text-sm font-medium text-[var(--text-2)] mb-2">
                    <span>Pitch</span>
                    <span className="text-[var(--text-1)]">{voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch}</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseInt(e.target.value) })}
                    className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Volume */}
                <div>
                  <label className="flex justify-between text-sm font-medium text-[var(--text-2)] mb-2">
                    <span>Volume</span>
                    <span className="text-[var(--text-1)]">{Math.round(voiceSettings.volume * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                    className="w-full accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Emotion */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Emotion
                  </label>
                  <select
                    value={voiceSettings.emotion}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, emotion: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black border border-[var(--border)] text-[var(--text-1)] text-sm rounded-lg focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="excited">Excited</option>
                    <option value="calm">Calm</option>
                  </select>
                </div>

                {/* Watermarking */}
                <div className="pt-4 flex items-center border-t border-[var(--border)]">
                  <input
                    type="checkbox"
                    id="watermark-toggle"
                    checked={addWatermark}
                    onChange={(e) => setAddWatermark(e.target.checked)}
                    className="w-4 h-4 text-white bg-black border border-[var(--border)] rounded focus:ring-1 focus:ring-white/30 cursor-pointer accent-white"
                  />
                  <label htmlFor="watermark-toggle" className="ml-3 block text-sm font-medium text-[var(--text-2)] cursor-pointer hover:text-[var(--text-1)] transition-colors">
                    Apply invisible watermark
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-1)] mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button onClick={onPickFile} className="w-full border border-[var(--border)] bg-white/5 p-3 rounded-lg flex items-center space-x-3 hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4 text-[var(--text-1)]" />
                  <span className="font-medium text-sm text-[var(--text-1)]">Upload Reference</span>
                </button>
                <input ref={fileInputRef} onChange={onFileChange} type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" className="hidden" />

                <button className="w-full border border-[var(--border)] bg-black p-3 rounded-lg flex items-center space-x-3 opacity-50 cursor-not-allowed">
                  <Mic className="w-4 h-4 text-[var(--text-2)]" />
                  <span className="font-medium text-sm text-[var(--text-2)]">Record Voice (soon)</span>
                </button>

                <button className="w-full border border-[var(--border)] bg-black p-3 rounded-lg flex items-center space-x-3 opacity-50 cursor-not-allowed">
                  <Zap className="w-4 h-4 text-[var(--text-2)]" />
                  <span className="font-medium text-sm text-[var(--text-2)]">API Access (pro)</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}