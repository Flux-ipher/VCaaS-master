'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, MoreVertical, Key, Activity, ShieldOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { getLicenses, deleteLicense, LicenseResponse } from '@/lib/api'
import { CreateLicenseModal } from '@/components/licensing/CreateLicenseModal'
import { GenerateTokenModal } from '@/components/licensing/GenerateTokenModal'
import { LicenseDetailsModal } from '@/components/licensing/LicenseDetailsModal'
import { getTrainedVoices } from '@/lib/api'

export default function LicensesDashboardPage() {
  const [licenses, setLicenses] = useState<LicenseResponse[]>([])
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(null)

  // Dropdown state for table rows
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [licensesRes, voicesRes] = await Promise.all([
        getLicenses(),
        getTrainedVoices().catch(() => [])
      ])
      setLicenses(licensesRes)
      if (Array.isArray(voicesRes)) {
        setVoices(voicesRes.map(v => ({ id: v.id, name: v.name })))
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load licenses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this license? Active tokens may stop working.')) return
    try {
      await deleteLicense(id)
      await fetchData() // refresh
    } catch (err) {
      console.error('Failed to deactivate license:', err)
      alert('Failed to deactivate license.')
    }
  }

  const openTokenModal = (id: string) => {
    setSelectedLicenseId(id)
    setIsTokenModalOpen(true)
    setOpenDropdownId(null)
  }

  const openDetailsModal = (id: string) => {
    setSelectedLicenseId(id)
    setIsDetailsModalOpen(true)
    setOpenDropdownId(null)
  }

  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (amount === undefined || amount === null) return 'Custom'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-1)] tracking-tight mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              Manage Licenses
            </h1>
            <p className="text-[var(--text-2)]">
              Create and manage commercial licenses for your voice clones
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary px-4 py-2 rounded-lg text-sm inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New License</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-[var(--text-2)] text-sm">Loading licenses...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-400">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p>{error}</p>
            </div>
          ) : licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-1)] mb-1">No licenses yet</h3>
              <p className="text-sm text-[var(--text-2)] mb-6 max-w-sm">
                You haven't created any licenses for your voices. Create one to start generating API tokens for your clients.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary px-4 py-2 rounded-lg text-sm inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First License</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--text-2)] uppercase bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {licenses.map((license) => (
                    <tr key={license.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--text-1)]">{license.name}</div>
                        <div className="text-xs text-[var(--text-3)] mt-1 font-mono">{license.id.substring(0, 12)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{license.license_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(license.price, license.currency)}
                      </td>
                      <td className="px-6 py-4">
                        {license.is_active ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-medium">
                            <ShieldOff className="w-3.5 h-3.5" />
                            Inactive
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === license.id ? null : license.id)}
                          className="p-1.5 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdownId === license.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-6 top-10 mt-1 w-48 bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => openDetailsModal(license.id)}
                                className="w-full text-left px-4 py-2 text-sm text-[var(--text-1)] hover:bg-[var(--surface-2)] flex items-center gap-2"
                              >
                                <Activity className="w-4 h-4 text-indigo-400" />
                                View Stats
                              </button>
                              <button
                                onClick={() => openTokenModal(license.id)}
                                disabled={!license.is_active}
                                className="w-full text-left px-4 py-2 text-sm text-[var(--text-1)] hover:bg-[var(--surface-2)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Key className="w-4 h-4 text-emerald-400" />
                                Generate Token
                              </button>
                              {license.is_active && (
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null)
                                    handleDeactivate(license.id)
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <ShieldOff className="w-4 h-4" />
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateLicenseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchData}
        voices={voices}
      />
      <GenerateTokenModal 
        isOpen={isTokenModalOpen} 
        onClose={() => setIsTokenModalOpen(false)} 
        licenseId={selectedLicenseId}
      />
      <LicenseDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        licenseId={selectedLicenseId}
      />
    </div>
  )
}
