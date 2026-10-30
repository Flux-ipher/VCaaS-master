'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { 
  Mic, 
  PlayCircle, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  Volume2,
  Brain
} from 'lucide-react'
import { Dock, DockItem, DockIcon, DockLabel } from '../components/Dock'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-6">
              Voice Clone as a{' '}
              <span className="gradient-text-berry">Service</span>
            </h1>
            
            <div className="h-16 flex items-center justify-center mb-8">
              <TypeAnimation
                sequence={[
                  'Your voice. Your license. Your rules.',
                  2000,
                  'Clone voices with ethical licensing.',
                  2000,
                  'Professional TTS with watermarking.',
                  2000,
                  'Creator-first voice platform.',
                  2000,
                ]}
                wrapper="p"
                speed={50}
                className="text-xl sm:text-2xl text-navy/80 font-medium"
                repeat={Infinity}
                cursor={true}
                style={{
                  display: 'inline-block',
                  minHeight: '2.5rem'
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/playground" className="btn-primary text-lg px-8 py-4 rounded-xl inline-flex items-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>Try Playground</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link href="/signup" className="btn-secondary text-lg px-8 py-4 rounded-xl inline-flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Start Creating</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-navy mb-4">
              Powerful Features for{' '}
              <span className="gradient-text-berry">Creators</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: 'Voice Cloning',
                description: 'Upload samples and create high-quality voice clones.',
                color: 'from-berry-500 to-berry-600'
              },
              {
                icon: Shield,
                title: 'Ethical Licensing',
                description: 'Built-in licensing with usage tracking.',
                color: 'from-twilight-600 to-twilight-700'
              },
              {
                icon: Volume2,
                title: 'Watermarking',
                description: 'Invisible watermarks for traceability.',
                color: 'from-berry-600 to-twilight-600'
              },
              {
                icon: Zap,
                title: 'Fast API',
                description: 'Lightning-fast TTS API with SDKs.',
                color: 'from-twilight-500 to-berry-500'
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-navy mb-3">{feature.title}</h3>
                  <p className="text-navy/70">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-navy mb-4">
              Ready to Clone Your Voice?
            </h2>
            <p className="text-lg text-navy/70 mb-8 max-w-2xl mx-auto">
              Join thousands of creators using VCaaS for ethical voice cloning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/training" className="btn-primary text-lg px-8 py-4 rounded-xl inline-flex items-center space-x-2">
                <Mic className="w-5 h-5" />
                <span>Create Voice</span>
              </Link>
              
              <Link href="/playground" className="btn-secondary text-lg px-8 py-4 rounded-xl inline-flex items-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>Try Demo</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-8 text-center"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-berry-500 to-berry-600 rounded-lg flex items-center justify-center mr-3">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-poppins font-bold gradient-text-berry">VCaaS</h3>
                  <p className="text-xs text-navy/70">Voice Clone as a Service</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                <Link href="/privacy" className="text-navy/70 hover:text-berry-600 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-navy/70 hover:text-berry-600 transition-colors">Terms</Link>
                <Link href="/support" className="text-navy/70 hover:text-berry-600 transition-colors">Support</Link>
                <Link href="/docs" className="text-navy/70 hover:text-berry-600 transition-colors">API Docs</Link>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-navy/10 text-center">
              <p className="text-sm text-navy/60">
                © 2024 VCaaS - Voice Clone as a Service. All rights reserved. Built with ❤️ for creators.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Dock */}
      <div className="fixed bottom-6 left-0 right-0 z-50">
        <Dock>
          <DockItem>
            <DockIcon>
              <Link href="/playground" aria-label="Playground">
                <PlayCircle className="h-8 w-8 text-navy" />
              </Link>
            </DockIcon>
            <DockLabel>Playground</DockLabel>
          </DockItem>
          <DockItem>
            <DockIcon>
              <Link href="/training" aria-label="Create Voice">
                <Mic className="h-8 w-8 text-navy" />
              </Link>
            </DockIcon>
            <DockLabel>Create Voice</DockLabel>
          </DockItem>
          <DockItem>
            <DockIcon>
              <Link href="/dashboard" aria-label="Dashboard">
                <Brain className="h-8 w-8 text-navy" />
              </Link>
            </DockIcon>
            <DockLabel>Dashboard</DockLabel>
          </DockItem>
          <DockItem>
            <DockIcon>
              <Link href="/security" aria-label="Security">
                <Shield className="h-8 w-8 text-navy" />
              </Link>
            </DockIcon>
            <DockLabel>Security</DockLabel>
          </DockItem>
        </Dock>
      </div>
    </div>
  )
}
