'use client'

import React from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

export default function DocsPage() {
  return (
    <div className="min-h-screen py-24 px-6 max-w-5xl mx-auto text-[var(--text-1)]">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-[var(--text-2)] mb-12">Integrate VCaaS voice cloning and deepfake detection directly into your own applications using our REST API.</p>
      </motion.div>

      <div className="space-y-16">
        {/* Authentication */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-[var(--border)] pb-2">Authentication</h2>
          <p className="text-[var(--text-2)] mb-4">
            All API endpoints require a Firebase ID token passed in the <code className="bg-[var(--bg-3)] px-1 rounded text-sm text-[var(--brand)]">Authorization</code> header.
          </p>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto border border-[var(--border)] font-mono text-sm text-gray-300">
            <code>Authorization: Bearer YOUR_FIREBASE_ID_TOKEN</code>
          </pre>
        </motion.section>

        {/* TTS Clone */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-[var(--border)] pb-2">Generate Voice Clone (Zero-Shot)</h2>
          <p className="text-[var(--text-2)] mb-4">
            Generates synthetic speech using a reference audio file. The output is automatically cryptographically watermarked.
          </p>
          <div className="bg-black/30 rounded-lg border border-[var(--border)] p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded text-xs">POST</span>
              <code className="text-sm">/api/v1/tts/clone</code>
            </div>
            <h4 className="font-medium text-white mb-2 text-sm">Request (multipart/form-data)</h4>
            <ul className="list-disc pl-5 text-sm text-[var(--text-2)] space-y-1 mb-4">
              <li><code className="text-white">text</code> (string, required): The text to synthesize.</li>
              <li><code className="text-white">reference</code> (file, required): A clean 5-10 second .wav or .mp3 sample of the target voice.</li>
              <li><code className="text-white">language</code> (string, optional): Language code (e.g., 'en'). Defaults to 'en'.</li>
            </ul>
          </div>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto border border-[var(--border)] font-mono text-sm text-gray-300">
            <code>
{`curl -X POST \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "text=Hello, this is a cloned voice." \\
  -F "language=en" \\
  -F "reference=@sample.wav" \\
  https://vcaas.onrender.com/api/v1/tts/clone --output result.wav`}
            </code>
          </pre>
        </motion.section>

        {/* Verify Full Analysis */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold text-white mb-4 border-b border-[var(--border)] pb-2">Deepfake Verification (6-Layer)</h2>
          <p className="text-[var(--text-2)] mb-4">
            Runs an audio file through our full 6-layer defense system (anti-spoofing, prosody, semantic coherence, and cryptographic watermark detection).
          </p>
          <div className="bg-black/30 rounded-lg border border-[var(--border)] p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-500/20 text-green-400 font-bold px-2 py-1 rounded text-xs">POST</span>
              <code className="text-sm">/api/v1/verify/full-analysis</code>
            </div>
            <h4 className="font-medium text-white mb-2 text-sm">Request (multipart/form-data)</h4>
            <ul className="list-disc pl-5 text-sm text-[var(--text-2)] space-y-1 mb-4">
              <li><code className="text-white">file</code> (file, required): The audio file to analyze (.wav, .mp3).</li>
            </ul>
          </div>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto border border-[var(--border)] font-mono text-sm text-gray-300 mb-4">
            <code>
{`curl -X POST \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@suspect_audio.wav" \\
  https://vcaas.onrender.com/api/v1/verify/full-analysis`}
            </code>
          </pre>
          <h4 className="font-medium text-white mb-2 text-sm">Response</h4>
          <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto border border-[var(--border)] font-mono text-sm text-gray-300">
            <code>
{`{
  "is_authentic": false,
  "confidence": 1.0,
  "reason": "Watermark detected: Synthetic audio",
  "layers": {
    "layer1_antispoof": { "passed": false, "score": 0.12 },
    "layer6_watermark": { "passed": false, "watermark_present": true }
  }
}`}
            </code>
          </pre>
        </motion.section>

      </div>
    </div>
  )
}
