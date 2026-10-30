import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateLicenseToken, LicenseTokenRequest } from '@/lib/api';

interface GenerateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseId: string | null;
}

export function GenerateTokenModal({ isOpen, onClose, licenseId }: GenerateTokenModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState<LicenseTokenRequest>({
    purchaser_email: '',
    purchaser_name: '',
    purchase_amount: 0,
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        purchaser_email: '',
        purchaser_name: '',
        purchase_amount: 0,
      });
      setError(null);
      setGeneratedToken(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purchase_amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;
    
    setError(null);
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.purchase_amount) delete payload.purchase_amount;
      if (!payload.purchaser_name) delete payload.purchaser_name;

      const res = await generateLicenseToken(licenseId, payload);
      setGeneratedToken(res.token);
    } catch (err: any) {
      console.error('Failed to generate token:', err);
      setError(err.response?.data?.detail || 'Failed to generate token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            className="relative w-full max-w-md bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-1)]">Generate Access Token</h2>
                  <p className="text-xs text-[var(--text-2)]">Issue a new token for this license</p>
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
            <div className="p-6">
              {generatedToken ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-1)] mb-2">Token Generated!</h3>
                    <p className="text-sm text-[var(--text-2)]">Copy this token and send it to the purchaser. They will use this for API access.</p>
                  </div>
                  
                  <div className="relative group">
                    <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl font-mono text-sm text-[var(--text-1)] break-all select-all text-left">
                      {generatedToken}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-2 bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-lg text-[var(--text-1)] hover:bg-white hover:text-black transition-all shadow-sm"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg text-left">
                    <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-500/90 leading-relaxed">
                      This token is only shown once. If lost, you will need to generate a new one.
                    </p>
                  </div>
                </div>
              ) : (
                <form id="generate-token-form" onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-2">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Purchaser Email *</label>
                    <input
                      type="email"
                      name="purchaser_email"
                      value={formData.purchaser_email}
                      onChange={handleChange}
                      required
                      placeholder="client@example.com"
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Purchaser Name</label>
                    <input
                      type="text"
                      name="purchaser_name"
                      value={formData.purchaser_name}
                      onChange={handleChange}
                      placeholder="Company or Individual"
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-2)]">Purchase Amount (Optional)</label>
                    <input
                      type="number"
                      name="purchase_amount"
                      value={formData.purchase_amount || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <p className="text-xs text-[var(--text-3)] mt-1">If this was a paid transaction, log the amount here for your stats.</p>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--surface-1)]">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  generatedToken
                    ? 'bg-[var(--surface-2)] text-[var(--text-1)] hover:bg-[var(--surface-3)] w-full'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {generatedToken ? 'Done' : 'Cancel'}
              </button>
              
              {!generatedToken && (
                <button
                  type="submit"
                  form="generate-token-form"
                  disabled={loading || !formData.purchaser_email}
                  className="btn btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  Generate
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
