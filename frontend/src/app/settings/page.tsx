'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2,
  Download,
  Upload,
  Trash2,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Database,
  Cloud,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'dark', // light, dark, system
    colorScheme: 'monochrome',
    glassEffect: false,
    animations: true,
    compactMode: false,
    
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    dataRetention: 90, // days
    analyticsTracking: true,
    
    defaultVoiceQuality: 'high',
    audioFormat: 'wav',
    sampleRate: 44100,
    autoWatermark: true,
    
    rateLimitWarning: true,
    webhookRetries: 3,
    apiTimeout: 30,
    
    autoBackup: true,
    cloudSync: true,
    localCache: true,
    storageLimit: 5000,
    
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  })

  const [activeTab, setActiveTab] = useState('general')

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'voice', name: 'Voice & Audio', icon: Volume2 },
    { id: 'api', name: 'API & Integration', icon: Zap },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'advanced', name: 'Advanced', icon: AlertTriangle }
  ]

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-black after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
    </label>
  )

  const SelectInput = ({ value, onChange, options }: { value: any, onChange: (val: any) => void, options: {value: any, label: string}[] }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg text-[var(--text-1)] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Theme</label>
                  <SelectInput
                    value={settings.theme}
                    onChange={(val) => updateSetting('theme', val)}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' }
                    ]}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">Animations</p>
                    <p className="text-sm text-[var(--text-2)]">Enable smooth transitions and effects</p>
                  </div>
                  <ToggleSwitch checked={settings.animations} onChange={(val) => updateSetting('animations', val)} />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--border)]">
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Language & Region</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Language</label>
                  <SelectInput
                    value={settings.language}
                    onChange={(val) => updateSetting('language', val)}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                      { value: 'de', label: 'German' }
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Timezone</label>
                  <SelectInput
                    value={settings.timezone}
                    onChange={(val) => updateSetting('timezone', val)}
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'Europe/London', label: 'London' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Smartphone },
                  { key: 'soundNotifications', label: 'Sound Notifications', desc: 'Play sounds for alerts', icon: Volume2 },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and offers', icon: Mail },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security notifications', icon: Shield }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-black border border-[var(--border)] rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[var(--text-1)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-1)]">{item.label}</p>
                          <p className="text-sm text-[var(--text-2)]">{item.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch checked={settings[item.key as keyof typeof settings] as boolean} onChange={(val) => updateSetting(item.key, val)} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-black border border-[var(--border)] rounded-lg">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">Two-Factor Authentication</p>
                    <p className="text-sm text-[var(--text-2)] mt-1">Add extra security to your account</p>
                  </div>
                  <button className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    {settings.twoFactorAuth ? 'Enabled' : 'Enable 2FA'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Session Timeout (minutes)</label>
                  <SelectInput
                    value={settings.sessionTimeout}
                    onChange={(val) => updateSetting('sessionTimeout', parseInt(val))}
                    options={[
                      { value: 15, label: '15 minutes' },
                      { value: 30, label: '30 minutes' },
                      { value: 60, label: '1 hour' },
                      { value: 120, label: '2 hours' },
                      { value: 0, label: 'Never' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg text-[var(--text-1)] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none"
                    min="30"
                    max="365"
                  />
                  <p className="text-xs text-[var(--text-2)] mt-2">How long to keep your data before automatic deletion</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'voice':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Voice & Audio Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Default Voice Quality</label>
                  <SelectInput
                    value={settings.defaultVoiceQuality}
                    onChange={(val) => updateSetting('defaultVoiceQuality', val)}
                    options={[
                      { value: 'low', label: 'Low (Fastest)' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High (Recommended)' },
                      { value: 'ultra', label: 'Ultra (Slowest)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Audio Format</label>
                  <SelectInput
                    value={settings.audioFormat}
                    onChange={(val) => updateSetting('audioFormat', val)}
                    options={[
                      { value: 'wav', label: 'WAV (Uncompressed)' },
                      { value: 'mp3', label: 'MP3 (Compressed)' },
                      { value: 'flac', label: 'FLAC (Lossless)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Sample Rate</label>
                  <SelectInput
                    value={settings.sampleRate}
                    onChange={(val) => updateSetting('sampleRate', parseInt(val))}
                    options={[
                      { value: 22050, label: '22.05 kHz' },
                      { value: 44100, label: '44.1 kHz (CD Quality)' },
                      { value: 48000, label: '48 kHz (Professional)' },
                      { value: 96000, label: '96 kHz (Hi-Res)' }
                    ]}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">Automatic Watermarking</p>
                    <p className="text-sm text-[var(--text-2)]">Add watermarks to all generated audio</p>
                  </div>
                  <ToggleSwitch checked={settings.autoWatermark} onChange={(val) => updateSetting('autoWatermark', val)} />
                </div>
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">API & Integration</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">API Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.apiTimeout}
                    onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg text-[var(--text-1)] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all appearance-none"
                    min="5"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Webhook Retry Attempts</label>
                  <SelectInput
                    value={settings.webhookRetries}
                    onChange={(val) => updateSetting('webhookRetries', parseInt(val))}
                    options={[
                      { value: 1, label: '1 retry' },
                      { value: 3, label: '3 retries' },
                      { value: 5, label: '5 retries' },
                      { value: 10, label: '10 retries' }
                    ]}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">Rate Limit Warnings</p>
                    <p className="text-sm text-[var(--text-2)]">Get notified when approaching rate limits</p>
                  </div>
                  <ToggleSwitch checked={settings.rateLimitWarning} onChange={(val) => updateSetting('rateLimitWarning', val)} />
                </div>
              </div>
            </div>
          </div>
        )

      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Storage & Backup</h3>
              <div className="space-y-6">
                <div className="bg-black border border-[var(--border)] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-medium text-[var(--text-1)]">Storage Usage</p>
                    <p className="text-sm text-[var(--text-2)]">2.1 GB of 5 GB used</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'autoBackup', label: 'Automatic Backup', desc: 'Backup data automatically', icon: Cloud },
                    { key: 'cloudSync', label: 'Cloud Synchronization', desc: 'Sync across devices', icon: Wifi },
                    { key: 'localCache', label: 'Local Cache', desc: 'Cache data locally for faster access', icon: HardDrive }
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-black border border-[var(--border)] rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[var(--text-1)]" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-1)]">{item.label}</p>
                            <p className="text-sm text-[var(--text-2)]">{item.desc}</p>
                          </div>
                        </div>
                        <ToggleSwitch checked={settings[item.key as keyof typeof settings] as boolean} onChange={(val) => updateSetting(item.key, val)} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-1)] mb-6">Advanced Settings</h3>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500">Caution</p>
                    <p className="text-sm text-amber-500/80">These settings can affect system performance and stability.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border)] pb-6">
                  <div>
                    <p className="font-medium text-[var(--text-1)]">Analytics Tracking</p>
                    <p className="text-sm text-[var(--text-2)]">Help improve VCaaS with anonymous usage data</p>
                  </div>
                  <ToggleSwitch checked={settings.analyticsTracking} onChange={(val) => updateSetting('analyticsTracking', val)} />
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-black border border-[var(--border)] p-4 rounded-lg text-left hover:bg-white/5 hover:border-white/30 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Download className="w-5 h-5 text-[var(--text-1)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-1)] group-hover:text-white transition-colors">Export All Data</p>
                        <p className="text-sm text-[var(--text-2)] mt-0.5">Download a copy of all your data</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-black border border-red-500/30 p-4 rounded-lg text-left hover:bg-red-500/5 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-red-400">Clear All Cache</p>
                        <p className="text-sm text-red-400/70 mt-0.5">Remove all locally cached data</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-black border border-red-500/30 p-4 rounded-lg text-left hover:bg-red-500/5 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-red-400">Reset All Settings</p>
                        <p className="text-sm text-red-400/70 mt-0.5">Restore default configuration</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--text-1)] tracking-tight mb-2">
            Settings ⚙️
          </h1>
          <p className="text-[var(--text-2)]">
            Customize your VCaaS experience and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sticky top-24"
            >
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-black font-medium'
                          : 'text-[var(--text-2)] hover:bg-white/5 hover:text-[var(--text-1)]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-black' : ''}`} />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8"
            >
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="flex justify-end pt-8 border-t border-[var(--border)] mt-10">
                <div className="flex space-x-4">
                  <button className="px-6 py-2.5 rounded-lg border border-[var(--border)] bg-black text-[var(--text-1)] hover:bg-white/5 hover:border-white/30 transition-all text-sm font-medium">
                    Reset
                  </button>
                  <button className="bg-white text-black px-6 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}