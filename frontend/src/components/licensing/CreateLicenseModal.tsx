import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, DollarSign, Clock, Users, FileText } from 'lucide-react';
import { createLicense, LicenseCreate } from '@/lib/api';

interface CreateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voices: { id: string; name: string }[];
}

export function CreateLicenseModal({ isOpen, onClose, onSuccess, voices }: CreateLicenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LicenseCreate>({
    voice_id: '',
    name: '',
    description: '',
    license_type: 'commercial',
    price: 0,
    currency: 'USD',
    duration_days: 0,
    usage_limit: 0,
  });

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        voice_id: voices.length > 0 ? voices[0].id : '',
        name: '',
        description: '',
        license_type: 'commercial',
        price: 0,
        currency: 'USD',
        duration_days: 0,
        usage_limit: 0,
      });
      setError(null);
    }
  }, [isOpen, voices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration_days' || name === 'usage_limit' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.duration_days) delete payload.duration_days;
      if (!payload.usage_limit) delete payload.usage_limit;
      if (!payload.price) delete payload.price;

      await createLicense(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create license:', err);
      setError(err.response?.data?.detail || 'Failed to create license. Please try again.');
    } finally {
      setLoading(false);
    }
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
            className="relative w-full max-w-lg bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-1)]">Create License</h2>
                  <p className="text-xs text-[var(--text-2)]">Configure terms for your cloned voice</p>
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
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <form id="create-license-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-2)]">Select Voice *</label>
                  <select
                    name="voice_id"
                    value={formData.voice_id}
                    onChange={handleChange}
                    required
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  >
                    <option value="" disabled>Select a voice</option>
                    {voices.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-2)]">License Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Commercial Standard"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-2)]">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Optional details about terms..."
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Type *</label>
                    <select
                      name="license_type"
                      value={formData.license_type}
                      onChange={handleChange}
                      required
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    >
                      <option value="personal">Personal</option>
                      <option value="commercial">Commercial</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="educational">Educational</option>
                      <option value="non_profit">Non-Profit</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="w-4 h-4 text-[var(--text-3)]" />
                      </div>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Duration (Days)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="w-4 h-4 text-[var(--text-3)]" />
                      </div>
                      <input
                        type="number"
                        name="duration_days"
                        value={formData.duration_days || ''}
                        onChange={handleChange}
                        min="1"
                        placeholder="Unlimited"
                        className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Usage Limit (API Calls)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="w-4 h-4 text-[var(--text-3)]" />
                      </div>
                      <input
                        type="number"
                        name="usage_limit"
                        value={formData.usage_limit || ''}
                        onChange={handleChange}
                        min="1"
                        placeholder="Unlimited"
                        className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--surface-1)]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-license-form"
                disabled={loading || !formData.voice_id || !formData.name}
                className="btn btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Create License
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
