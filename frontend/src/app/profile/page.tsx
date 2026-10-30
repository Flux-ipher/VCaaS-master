'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Key,
  Bell,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const [localUserExists, setLocalUserExists] = useState(false)

  useEffect(() => {
    let hasLocalUser = false
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vcaas_user')
      if (stored) {
        hasLocalUser = true
        setLocalUserExists(true)
      }
    }

    if (!loading && !user && !hasLocalUser) {
      router.push('/login')
    }
  }, [user, loading, router])

  const [profile, setProfile] = useState({
    name: user?.displayName || 'Creator User',
    email: user?.email || '',
    phone: (user as any)?.phoneNumber || 'Not provided',
    location: 'Not specified',
    company: '',
    role: '',
    joinDate: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently',
    bio: 'Content creator on VCaaS.',
    avatar: user?.photoURL || 'https://ui-avatars.com/api/?name=User&background=random&size=150',
    plan: 'Basic',
    apiKey: 'vcaas_sk_********************',
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  })

  useEffect(() => {
    let localProfile: any = null
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vcaas_user')
      if (stored) {
        try {
          localProfile = JSON.parse(stored)
        } catch (e) {}
      }
    }

    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.displayName || localProfile?.name || prev.name,
        email: user.email || localProfile?.email || prev.email,
        phone: (user as any).phoneNumber || prev.phone,
        avatar: user.photoURL || prev.avatar,
        joinDate: user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : prev.joinDate
      }))
    } else if (localProfile) {
      setProfile(prev => ({
        ...prev,
        name: localProfile.name || localProfile.username || prev.name,
        email: localProfile.email || prev.email,
        company: localProfile.company || prev.company,
        role: localProfile.role || prev.role,
        location: localProfile.location || prev.location,
        bio: localProfile.bio || prev.bio,
      }))
    }
  }, [user])

  const [editProfile, setEditProfile] = useState(profile)

  const handleSave = async () => {
    try {
      import('@/lib/api').then(async ({ updateProfile }) => {
        await updateProfile({
          full_name: editProfile.name,
          company: editProfile.company,
          role: editProfile.role,
          location: editProfile.location,
          bio: editProfile.bio
        })
      }).catch(console.error);
      setProfile(editProfile)
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCancel = () => {
    setEditProfile(profile)
    setIsEditing(false)
  }

  const stats = [
    { label: 'Voices Created', value: '12', icon: User },
    { label: 'Audio Generated', value: '1.2K', icon: Download },
    { label: 'API Calls', value: '8.7K', icon: Key },
    { label: 'Total Usage', value: '342 min', icon: Calendar }
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user && !localUserExists) return null;

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
            Profile Settings 👤
          </h1>
          <p className="text-[var(--text-2)]">
            Manage your account, preferences, and API access
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-1)]">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="border border-[var(--border)] bg-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/10 hover:border-white/30 transition-all text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 text-[var(--text-2)]" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border border-[var(--border)] bg-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      <X className="w-4 h-4 text-[var(--text-2)]" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Avatar */}
                <div className="md:col-span-2 flex items-center space-x-6 pb-6 border-b border-[var(--border)]">
                  <div className="relative">
                    {profile.avatar.includes('placeholder') ? (
                      <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    ) : (
                      <img src={profile.avatar} alt="Profile Avatar" className="w-20 h-20 rounded-full object-cover border border-white/20 shadow-lg" />
                    )}
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-black border border-[var(--border)] rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg">
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-1)]">{profile.name}</h3>
                    <p className="text-[var(--text-2)] text-sm mb-1">{profile.plan} Plan Member</p>
                    <p className="text-xs text-[var(--text-2)]/60">Member since {profile.joinDate}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <User className="w-4 h-4 text-[var(--text-2)]" />
                      <span className="text-[var(--text-1)] font-medium">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <Mail className="w-4 h-4 text-[var(--text-2)]" />
                      <span className="text-[var(--text-1)] font-medium">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <Phone className="w-4 h-4 text-[var(--text-2)]" />
                      <span className="text-[var(--text-1)] font-medium">{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.location}
                      onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <MapPin className="w-4 h-4 text-[var(--text-2)]" />
                      <span className="text-[var(--text-1)] font-medium">{profile.location}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.company}
                      onChange={(e) => setEditProfile({...editProfile, company: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <span className="text-[var(--text-1)] font-medium">{profile.company || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Role
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.role}
                      onChange={(e) => setEditProfile({...editProfile, role: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)]"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 px-4 py-3 bg-black border border-transparent rounded-lg">
                      <span className="text-[var(--text-1)] font-medium">{profile.role || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-[var(--text-1)] h-24 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-black border border-transparent rounded-lg">
                      <p className="text-[var(--text-1)] font-medium">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* API Access */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold text-[var(--text-1)] mb-6 flex items-center space-x-2">
                <Key className="w-5 h-5 text-[var(--text-2)]" />
                <span>API Access</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">
                    Secret API Key
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={profile.apiKey}
                      readOnly
                      className="w-full px-4 py-3 bg-black border border-[var(--border)] rounded-lg text-[var(--text-1)] focus:outline-none focus:border-white/30 transition-all font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-3 border border-[var(--border)] bg-black hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4 text-[var(--text-2)]" /> : <Eye className="w-4 h-4 text-[var(--text-2)]" />}
                    </button>
                    <button className="px-4 py-3 border border-[var(--border)] bg-black hover:bg-white/10 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                      Copy Key
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-2)] mt-2">
                    Use this key to authenticate API requests. Keep it secret.
                  </p>
                </div>

                <div className="flex space-x-4 border-t border-[var(--border)] pt-6">
                  <button className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Generate New Key
                  </button>
                  <button className="border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Revoke Key</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8"
            >
              <h3 className="text-lg font-semibold text-[var(--text-1)] mb-6">Account Stats</h3>
              
              <div className="space-y-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-center space-x-4 p-3 bg-black border border-[var(--border)] rounded-lg hover:border-white/20 transition-colors">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--text-1)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-1)] leading-tight">{stat.value}</p>
                        <p className="text-xs text-[var(--text-2)]">{stat.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8"
            >
              <h3 className="text-lg font-semibold text-[var(--text-1)] mb-6 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[var(--text-2)]" />
                <span>Security Settings</span>
              </h3>
              
              <div className="space-y-3">
                <button className="w-full border border-[var(--border)] bg-black p-4 rounded-lg text-left hover:bg-white/5 hover:border-white/30 transition-all group">
                  <p className="font-medium text-[var(--text-1)] group-hover:text-white transition-colors">Change Password</p>
                  <p className="text-xs text-[var(--text-2)] mt-0.5">Update your account password</p>
                </button>
                
                <button className="w-full border border-[var(--border)] bg-black p-4 rounded-lg text-left hover:bg-white/5 hover:border-white/30 transition-all group">
                  <p className="font-medium text-[var(--text-1)] group-hover:text-white transition-colors">Two-Factor Auth</p>
                  <p className="text-xs text-[var(--text-2)] mt-0.5">Enable 2FA for extra security</p>
                </button>
                
                <button className="w-full border border-[var(--border)] bg-black p-4 rounded-lg text-left hover:bg-white/5 hover:border-white/30 transition-all group">
                  <p className="font-medium text-[var(--text-1)] group-hover:text-white transition-colors">Login History</p>
                  <p className="text-xs text-[var(--text-2)] mt-0.5">View recent account activity</p>
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-6 py-3 rounded-lg flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}