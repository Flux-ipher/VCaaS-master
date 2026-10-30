'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  Activity,
  ShieldAlert,
  Settings,
  ShieldCheck,
  LogOut,
  Eye,
  Trash2,
  Edit2,
  Server,
  Database,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Cpu
} from 'lucide-react'
import { adminAuth, useAdminAuth } from '@/lib/adminAuth'

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, logout, hasPermission } = useAdminAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }
    try {
      const data = adminAuth.getAdminDashboardData()
      setDashboardData({
        ...data,
        adminInfo: { role: 'admin', ...data.adminInfo },
        systemStats: {
          ...data.systemStats,
          activeUsers: data.systemStats?.activeUsers ?? data.systemStats?.totalUsers ?? 0,
          activeVoices: data.systemStats?.activeVoices ?? 0,
        },
        systemHealth: {
          ...data.systemHealth,
          cpuUsage: data.systemHealth?.cpuUsage ?? 'Unavailable',
          memoryUsage: data.systemHealth?.memoryUsage ?? 'Unavailable',
        },
        securityAlerts: data.securityAlerts ?? data.alerts ?? [],
      })
    } catch (error) {
      // router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, router])

  const handleLogout = () => {
    logout()
    adminAuth.disableAdminFeatures()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="h-12 w-12 text-[var(--accent)] mb-4 animate-bounce" />
          <p className="text-[var(--text-2)] font-mono text-sm">INITIALIZING_SECURE_CONSOLE...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--surface-1)]/95 border-b border-[var(--border)] backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--accent-bg)] rounded-xl border border-[var(--accent-border)] shadow-[0_0_24px_rgba(232,54,93,0.16)]">
              <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Admin<span className="text-[var(--text-3)]">Console</span></h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" /> Live
                </span>
              </div>
              <p className="text-xs text-[var(--text-3)] mt-0.5">Operations and trust center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-[var(--text-2)] bg-[var(--surface-2)] px-3 py-1.5 rounded-full border border-[var(--border)]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {dashboardData.adminInfo.role.toUpperCase()}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[var(--text-2)] hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="mb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">Console navigation</div>
          <div className="space-y-2">
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'users', icon: Users, label: 'User Directory', permission: 'canManageUsers' },
            { id: 'system', icon: Server, label: 'System Status', permission: 'canManageSystem' },
            { id: 'analytics', icon: BarChart3, label: 'Global Analytics', permission: 'canAccessAnalytics' }
          ].map(tab => {
            if (tab.permission && !hasPermission(tab.permission as any)) return null
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                  ? 'bg-[var(--surface-2)] text-white border border-[var(--border-strong)] shadow-[0_8px_24px_rgba(0,0,0,0.16)]'
                  : 'text-[var(--text-2)] hover:bg-[var(--surface-1)] hover:text-[var(--text-1)] border border-transparent'
                }`}
              >
                <span className={`h-7 w-1 rounded-full transition-colors ${isActive ? 'bg-[var(--accent)]' : 'bg-transparent group-hover:bg-[var(--border-strong)]'}`} />
                <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--accent)]' : ''}`} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
          </div>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--text-2)]">Platform health</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div className="h-full w-[92%] rounded-full bg-emerald-400" />
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-3)]">All critical services operational</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Command center</p>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Good evening, operator.</h2>
                      <p className="text-sm text-[var(--text-2)] mt-1">A concise view of platform activity, trust signals, and capacity.</p>
                    </div>
                    <span className="text-xs text-[var(--text-3)] font-mono">UPDATED JUST NOW</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Users" value={dashboardData.systemStats.activeUsers.toLocaleString()} icon={Users} trend="+12%" />
                    <StatCard title="Total Voices" value={dashboardData.systemStats.activeVoices.toLocaleString()} icon={Database} trend="+4%" />
                    <StatCard title="System Load" value={dashboardData.systemHealth.cpuUsage} icon={Cpu} alert={parseInt(dashboardData.systemHealth.cpuUsage) > 80} />
                    <StatCard title="Memory" value={dashboardData.systemHealth.memoryUsage} icon={Server} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] mb-1">Trust signals</p>
                          <h3 className="text-lg font-semibold">Security Events</h3>
                        </div>
                        <ShieldAlert className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div className="space-y-3">
                        {dashboardData.securityAlerts.map((alert: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-mid)]">
                            {alert.severity === 'high' ? <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />}
                            <div>
                              <p className="text-sm font-medium text-[var(--text-1)]">{alert.type}</p>
                              <p className="text-xs text-[var(--text-2)]">{alert.details}</p>
                            </div>
                            <span className="ml-auto text-xs font-mono text-[var(--text-3)]">{alert.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-3)] mb-1">Operator tools</p>
                          <h3 className="text-lg font-semibold">Quick Actions</h3>
                        </div>
                        <Settings className="h-5 w-5 text-[var(--text-3)]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <ActionButton icon={Cloud} label="Flush Cache" />
                        <ActionButton icon={ShieldCheck} label="Audit Logs" />
                        <ActionButton icon={Settings} label="Global Config" />
                        <ActionButton icon={CheckCircle2} label="Health Check" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-2)]">
                    <h2 className="text-lg font-semibold">User Directory</h2>
                    <input 
                      type="text" 
                      placeholder="Search users by email..." 
                      className="bg-black border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)] w-64"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[var(--surface-3)] text-[var(--text-2)] font-medium">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Plan</th>
                          <th className="px-6 py-4">Voices</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {[
                          { email: 'admin@vcaas.com', plan: 'Enterprise', voices: 24, role: 'Admin' },
                          { email: 'john@example.com', plan: 'Pro', voices: 4, role: 'User' },
                          { email: 'demo@example.com', plan: 'Free', voices: 1, role: 'User' }
                        ].map((u, i) => (
                          <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 flex items-center justify-center text-xs font-bold text-white">
                                  {u.email[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[var(--text-1)]">{u.email}</p>
                                  <p className="text-xs text-[var(--text-3)]">{u.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                                u.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                u.plan === 'Pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                              }`}>{u.plan}</span>
                            </td>
                            <td className="px-6 py-4 text-[var(--text-2)]">{u.voices}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-[var(--text-3)] hover:text-[var(--text-1)] bg-[var(--surface-3)] rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                                <button className="p-2 text-[var(--text-3)] hover:text-blue-400 bg-[var(--surface-3)] rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                                <button className="p-2 text-[var(--text-3)] hover:text-red-400 bg-[var(--surface-3)] rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Server className="h-5 w-5 text-blue-400" /> Infrastructure</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                        <span className="text-[var(--text-2)] text-sm">App Server</span>
                        <span className="text-sm font-medium text-emerald-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Online</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                        <span className="text-[var(--text-2)] text-sm">Database</span>
                        <span className="text-sm font-medium text-emerald-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Connected</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                        <span className="text-[var(--text-2)] text-sm">Inference Engine (XTTS)</span>
                        <span className="text-sm font-medium text-emerald-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Modal Provisioned</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 h-96 flex items-center justify-center">
                  <div className="text-center text-[var(--text-3)]">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Advanced metrics visualization module loading...</p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, alert }: any) {
  return (
    <div className={`bg-[var(--surface-1)] border ${alert ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[var(--border)]'} rounded-2xl p-5 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-16 w-16" />
      </div>
      <h4 className="text-sm font-medium text-[var(--text-2)] mb-2">{title}</h4>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && <span className="text-sm font-medium text-emerald-400 mb-1">{trend}</span>}
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)] transition-all">
      <Icon className="h-5 w-5 text-[var(--text-2)]" />
      <span className="text-sm font-medium text-[var(--text-1)]">{label}</span>
    </button>
  )
}