'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
  DollarSign,
  Download,
  Crown,
  Zap,
  Activity
} from 'lucide-react'

interface BillingInfo {
  plan: string
  status: 'active' | 'cancelled' | 'past_due'
  nextBilling: Date
  amount: number
  currency: string
  paymentMethod: string
  cardLast4: string
}

interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed'
  downloadUrl?: string
}

export default function BillingPage() {
  const [currentBilling] = useState<BillingInfo>({
    plan: 'Creator',
    status: 'active',
    nextBilling: new Date('2024-02-15'),
    amount: 29,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    cardLast4: '4242'
  })

  const [transactions] = useState<Transaction[]>([
    {
      id: 'inv_001',
      date: new Date('2024-01-15'),
      description: 'Creator Plan - January 2024',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: new Date('2023-12-15'),
      description: 'Creator Plan - December 2023',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: new Date('2023-11-15'),
      description: 'Creator Plan - November 2023',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    }
  ])

  const [showCancelModal, setShowCancelModal] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const CancelSubscriptionModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[var(--text-1)]">Cancel Subscription</h3>
          <button
            onClick={() => setShowCancelModal(false)}
            className="text-[var(--text-2)] hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-start p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-amber-500/90 leading-relaxed">
              You'll continue to have access to your Creator plan features until <span className="font-semibold text-amber-400">{formatDate(currentBilling.nextBilling)}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="font-medium text-[var(--text-1)]">What happens when you cancel:</h4>
          <ul className="text-sm text-[var(--text-2)] space-y-2">
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)] mr-2"></span> Your subscription will not renew</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)] mr-2"></span> You'll keep access until {formatDate(currentBilling.nextBilling)}</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)] mr-2"></span> Your voice clones will be preserved</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-2)] mr-2"></span> You can reactivate anytime</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowCancelModal(false)}
            className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-1)] bg-black hover:bg-white/10 transition-all"
          >
            Keep Subscription
          </button>
          <button
            onClick={() => {
              console.log('Subscription cancelled')
              alert('Subscription has been cancelled')
              setShowCancelModal(false)
            }}
            className="flex-1 px-4 py-2.5 border border-red-500/20 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center space-x-4"
        >
          <Link href="/dashboard" className="p-2 border border-[var(--border)] bg-black rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-[var(--text-1)]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-1)] tracking-tight mb-2 flex items-center space-x-3">
              <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <span>Billing & Subscription</span>
            </h1>
            <p className="text-[var(--text-2)]">
              Manage your subscription and payment details
            </p>
          </div>
        </motion.div>

        {/* Current Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-8 shadow-2xl"
        >
          <div className="p-6 border-b border-[var(--border)] flex items-center space-x-3 bg-black/50">
            <Crown className="w-5 h-5 text-[var(--text-2)]" />
            <h3 className="text-lg font-semibold text-[var(--text-1)]">Current Subscription</h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h4 className="text-2xl font-bold text-[var(--text-1)] mb-1">{currentBilling.plan} Plan</h4>
                <p className="text-4xl font-black text-white flex items-baseline">
                  {formatCurrency(currentBilling.amount, currentBilling.currency)}
                  <span className="text-lg text-[var(--text-2)] font-medium ml-1">/month</span>
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 border w-fit ${
                currentBilling.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span className="capitalize">{currentBilling.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black border border-[var(--border)] p-5 rounded-xl flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[var(--text-1)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-2)] mb-1">Next Billing Date</p>
                  <p className="font-semibold text-[var(--text-1)]">{formatDate(currentBilling.nextBilling)}</p>
                </div>
              </div>
              
              <div className="bg-black border border-[var(--border)] p-5 rounded-xl flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[var(--text-1)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-2)] mb-1">Payment Method</p>
                  <p className="font-semibold text-[var(--text-1)]">{currentBilling.paymentMethod} •••• {currentBilling.cardLast4}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row gap-4">
              <Link 
                href="/pricing"
                className="bg-white text-black px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold hover:bg-gray-200 transition-colors"
              >
                <Zap className="h-4 w-4" />
                <span>Upgrade Plan</span>
              </Link>
              <button
                onClick={() => alert('Payment method update would be implemented here')}
                className="bg-black border border-[var(--border)] px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-[var(--text-1)] hover:bg-white/10 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Update Payment</span>
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="bg-red-500/5 border border-red-500/20 px-6 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center space-x-2 font-semibold sm:ml-auto"
              >
                <X className="h-4 w-4" />
                <span>Cancel Plan</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-8 shadow-2xl"
        >
          <div className="p-6 border-b border-[var(--border)] flex items-center space-x-3 bg-black/50">
            <Activity className="w-5 h-5 text-[var(--text-2)]" />
            <h3 className="text-lg font-semibold text-[var(--text-1)]">Current Usage</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border border-[var(--border)] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[var(--text-2)]">Voice Clones</span>
                  <span className="text-sm text-[var(--text-1)] font-bold">3 / 10</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="bg-white h-full rounded-full"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '30%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
              
              <div className="bg-black border border-[var(--border)] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[var(--text-2)]">Monthly Generation</span>
                  <span className="text-sm text-[var(--text-1)] font-bold">2.5h / 5h</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="bg-white h-full rounded-full"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '50%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
              
              <div className="bg-black border border-[var(--border)] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-[var(--text-2)]">API Calls</span>
                  <span className="text-sm text-[var(--text-1)] font-bold">1,250 / 10,000</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    className="bg-white h-full rounded-full"
                    initial={{ width: '0%' }}
                    whileInView={{ width: '12.5%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-sm text-[var(--text-2)]">
                🔄 Usage resets on <span className="font-semibold text-white">{formatDate(currentBilling.nextBilling)}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-[var(--border)] flex items-center space-x-3 bg-black/50">
            <FileText className="w-5 h-5 text-[var(--text-2)]" />
            <h3 className="text-lg font-semibold text-[var(--text-1)]">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-2)] uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {transactions.map((transaction, index) => (
                  <motion.tr 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-5 text-sm text-[var(--text-1)]">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--text-1)]">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-white">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 border ${
                        transaction.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        transaction.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {transaction.downloadUrl && (
                        <button
                          onClick={() => alert('Invoice download would be implemented here')}
                          className="text-[var(--text-2)] hover:text-white inline-flex items-center space-x-2 font-medium bg-black border border-[var(--border)] hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {showCancelModal && <CancelSubscriptionModal />}
    </div>
  )
}
