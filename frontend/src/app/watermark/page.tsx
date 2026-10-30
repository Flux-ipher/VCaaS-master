'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Activity, ShieldCheck, CheckCircle2, Lock, FileSearch, ArrowRight, Music, AlertCircle } from 'lucide-react'

export default function WatermarkShowcasePage() {
  const [activeTab, setActiveTab] = useState<'inject' | 'extract'>('inject')
  
  // Injection State
  const [text, setText] = useState('Hello, this audio is cryptographically watermarked.')
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [isInjecting, setIsInjecting] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const injectFileInput = useRef<HTMLInputElement>(null)

  // Extraction State
  const [extractFile, setExtractFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<any>(null)
  const extractFileInput = useRef<HTMLInputElement>(null)

  const handleInject = async () => {
    if (!referenceFile || !text) return
    setIsInjecting(true)
    setGeneratedAudio(null)
    try {
      const { cloneZeroShot } = await import('@/lib/api')
      const blob = await cloneZeroShot(text, 'en', referenceFile, true)
      const url = URL.createObjectURL(new Blob([blob], { type: 'audio/wav' }))
      setGeneratedAudio(url)
    } catch (err: any) {
      alert(err.message || 'Injection failed.')
    } finally {
      setIsInjecting(false)
    }
  }

  const handleExtract = async () => {
    if (!extractFile) return
    setIsExtracting(true)
    setExtractResult(null)
    try {
      const { verifyWatermark } = await import('@/lib/api')
      const res = await verifyWatermark(extractFile)
      setExtractResult(res)
    } catch (err: any) {
      setExtractResult({ error: err.message || 'Extraction failed' })
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Educational Content */}
          <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-xs font-medium text-[#3b82f6] tracking-wider uppercase">Patented Technology</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[var(--text-1)]">
                Invisible Acoustic Watermarking
              </h1>
              <p className="text-[var(--text-2)] text-lg leading-relaxed">
                VCaaS permanently embeds an inaudible, cryptographic signature into every generated voice clone. 
                This ensures that deepfakes can always be mathematically proven as synthetic.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-[var(--surface-1)] border border-[var(--border)] p-6 rounded-2xl">
                <Activity className="w-8 h-8 text-[#3b82f6] mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-1)] mb-2">19kHz Sine Carrier</h3>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">
                  We use an ultra-high frequency band (19kHz) that is imperceptible to human hearing but perfectly preserved by standard microphones and compression algorithms like MP3.
                </p>
              </div>
              <div className="bg-[var(--surface-1)] border border-[var(--border)] p-6 rounded-2xl">
                <Lock className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-1)] mb-2">Cryptographic Payload</h3>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">
                  The embedded signal isn't just a tone. It encodes a 16-character hexadecimal payload mathematically signed using a secure HMAC key, making it impossible to forge.
                </p>
              </div>
            </div>

            <div className="bg-[var(--surface-2)] p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-lg font-medium text-[var(--text-1)] mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Try it yourself
              </h3>
              <p className="text-sm text-[var(--text-2)] mb-4">
                1. Use the <strong>Inject</strong> tab to clone a voice. The system will automatically embed the 19kHz signature.
                <br/><br/>
                2. Download the resulting audio file.
                <br/><br/>
                3. Use the <strong>Extract</strong> tab to re-upload it. Watch as the cryptographic payload is instantly recovered from the raw audio waveform.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Interactive UI */}
          <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[var(--surface-1)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl"
        >
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              <button 
                onClick={() => setActiveTab('inject')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'inject' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-b-2 border-[#3b82f6]' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'}`}
              >
                1. Inject Watermark
              </button>
              <button 
                onClick={() => setActiveTab('extract')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'extract' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'}`}
              >
                2. Extract & Verify
              </button>
            </div>

            <div className="p-8">
              {/* Inject Tab */}
              {activeTab === 'inject' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Synthesis Prompt</label>
                    <textarea 
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full h-24 bg-black border border-[var(--border)] rounded-xl p-3 text-[var(--text-1)] focus:outline-none focus:border-[#3b82f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Reference Voice</label>
                    <input ref={injectFileInput} type="file" accept="audio/*" className="hidden" onChange={e => setReferenceFile(e.target.files?.[0] || null)} />
                    <button 
                      onClick={() => injectFileInput.current?.click()}
                      className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-colors ${referenceFile ? 'border-[#3b82f6]/50 bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[var(--border)] hover:border-white/30 text-[var(--text-2)]'}`}
                    >
                      {referenceFile ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      {referenceFile ? referenceFile.name : 'Upload Reference Audio (.wav/.mp3)'}
                    </button>
                  </div>

                  <button 
                    onClick={handleInject}
                    disabled={isInjecting || !referenceFile}
                    className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isInjecting ? 'Injecting Watermark...' : 'Generate & Inject Watermark'}
                  </button>

                  {generatedAudio && (
                    <div className="pt-6 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Success! Audio watermarked.</span>
                      </div>
                      <audio src={generatedAudio} controls className="w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* Extract Tab */}
              {activeTab === 'extract' && (
                <div className="space-y-6">
                  <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-2xl bg-black/50">
                    <FileSearch className="w-12 h-12 text-[var(--text-3)] mx-auto mb-4" />
                    <p className="text-[var(--text-2)] text-sm mb-4">Upload any audio file to scan for the 19kHz VCaaS cryptographic signature.</p>
                    <input ref={extractFileInput} type="file" accept="audio/*" className="hidden" onChange={e => setExtractFile(e.target.files?.[0] || null)} />
                    <button 
                      onClick={() => extractFileInput.current?.click()}
                      className="px-6 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-full text-sm font-medium text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      {extractFile ? extractFile.name : 'Select File'}
                    </button>
                  </div>

                  <button 
                    onClick={handleExtract}
                    disabled={isExtracting || !extractFile}
                    className="w-full py-4 bg-[#3b82f6] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isExtracting ? 'Scanning frequencies...' : 'Extract Payload'}
                  </button>

                  {extractResult && (
                    <div className="pt-6 border-t border-[var(--border)]">
                      {extractResult.error ? (
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">
                          {extractResult.error}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl border ${extractResult.watermark_found ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--surface-2)] border-[var(--border)]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[var(--text-2)]">Status</span>
                              <span className={`font-bold ${extractResult.watermark_found ? 'text-emerald-400' : 'text-red-400'}`}>
                                {extractResult.watermark_found ? 'SIGNATURE DETECTED' : 'NOT FOUND'}
                              </span>
                            </div>
                            {extractResult.watermark_found && (
                              <div className="pt-4 mt-4 border-t border-emerald-500/20">
                                <span className="block text-xs text-[var(--text-3)] mb-1">Decrypted Hex Payload:</span>
                                <code className="block bg-black/50 p-3 rounded-lg text-emerald-300 font-mono text-sm break-all border border-emerald-500/20">
                                  {extractResult.watermark_id || extractResult.payload || '0xUNKNOWN'}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
