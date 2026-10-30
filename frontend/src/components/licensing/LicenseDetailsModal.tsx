import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Users, DollarSign, Clock, PlayCircle, Fingerprint } from 'lucide-react';
import { getLicenseStats, getLicenseUsage, LicenseStats, LicenseUsageResponse } from '@/lib/api';

interface LicenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseId: string | null;
}

export function LicenseDetailsModal({ isOpen, onClose, licenseId }: LicenseDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [usage, setUsage] = useState<LicenseUsageResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && licenseId) {
      fetchDetails();
    }
  }, [isOpen, licenseId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usageRes] = await Promise.all([
        getLicenseStats(licenseId!),
        getLicenseUsage(licenseId!, 20)
      ]);
      setStats(statsRes);
      setUsage(usageRes);
    } catch (err: any) {
      console.error('Failed to fetch license details:', err);
      setError('Failed to load license statistics.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-1)]">License Statistics</h2>
                  <p className="text-xs text-[var(--text-2)]">{stats?.license_name || 'Loading...'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-2)]">Loading statistics...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              ) : stats ? (
                <div className="space-y-8">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2 text-[var(--text-2)]">
                        <PlayCircle className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Total Uses</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-1)]">{formatNumber(stats.total_uses)}</p>
                      {stats.usage_limit && (
                        <p className="text-xs text-[var(--text-3)] mt-1">{formatNumber(stats.usage_remaining || 0)} remaining</p>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2 text-[var(--text-2)]">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Unique Users</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-1)]">{formatNumber(stats.unique_users)}</p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2 text-[var(--text-2)]">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Audio Gen</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-1)]">
                        {stats.total_audio_duration ? (stats.total_audio_duration / 60).toFixed(1) : '0'}
                      </p>
                      <p className="text-xs text-[var(--text-3)] mt-1">minutes total</p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2 text-[var(--text-2)]">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-1)]">${formatNumber(stats.total_revenue)}</p>
                      <p className="text-xs text-[var(--text-3)] mt-1">{stats.currency}</p>
                    </div>
                  </div>

                  {/* Usage History Table */}
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-1)] mb-4 uppercase tracking-wider">Recent Activity</h3>
                    {usage.length === 0 ? (
                      <div className="text-center py-8 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] border-dashed">
                        <p className="text-[var(--text-2)] text-sm">No usage activity yet.</p>
                      </div>
                    ) : (
                      <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[var(--text-2)] uppercase bg-[var(--surface-3)] border-b border-[var(--border)]">
                              <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Token ID</th>
                                <th className="px-4 py-3 font-medium text-right">Chars</th>
                                <th className="px-4 py-3 font-medium">Watermark</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {usage.map((record) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap text-[var(--text-2)]">{formatDate(record.used_at)}</td>
                                  <td className="px-4 py-3 font-mono text-[var(--text-2)]">
                                    {record.token_id ? record.token_id.substring(0, 8) + '...' : 'Unknown'}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">{record.text_length}</td>
                                  <td className="px-4 py-3">
                                    {record.watermark_id ? (
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs">
                                        <Fingerprint className="w-3 h-3" />
                                        Applied
                                      </div>
                                    ) : (
                                      <span className="text-[var(--text-3)] text-xs">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] flex justify-end bg-[var(--surface-1)]">
              <button
                onClick={onClose}
                className="btn btn-secondary px-6 py-2.5 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
