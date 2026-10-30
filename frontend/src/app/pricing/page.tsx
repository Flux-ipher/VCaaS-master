'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Sparkles,
  ArrowLeft,
  CreditCard,
  Globe,
  Shield,
  Rocket
} from 'lucide-react'
import { subscriptionPlans, calculateYearlySavings } from '@/lib/subscription'

interface PricingFeature {
  name: string
  starter: boolean | string
  pro: boolean | string  
  enterprise: boolean | string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const features: PricingFeature[] = [
    { name: 'Voice Models', starter: '3 models', pro: '15 models', enterprise: 'Unlimited' },
    { name: 'Monthly Minutes', starter: '60 minutes', pro: '500 minutes', enterprise: '2500 minutes' },
    { name: 'Voice Quality', starter: 'Basic', pro: 'High-quality', enterprise: 'Premium' },
    { name: 'Storage', starter: '1GB', pro: '10GB', enterprise: '100GB' },
    { name: 'API Access', starter: false, pro: true, enterprise: true },
    { name: 'Custom Voice Training', starter: false, pro: true, enterprise: true },
    { name: 'Priority Support', starter: false, pro: true, enterprise: true },
    { name: 'Advanced Analytics', starter: false, pro: false, enterprise: true },
    { name: 'White-label Options', starter: false, pro: false, enterprise: true },
    { name: 'Custom Integrations', starter: false, pro: false, enterprise: true },
    { name: 'Dedicated Support', starter: false, pro: false, enterprise: '24/7 Support' }
  ]

  const getPrice = (plan: any) => billingCycle === 'yearly' ? plan.yearlyPrice : plan.price

  const getSavings = (plan: any) => {
    if (billingCycle === 'monthly' || plan.price === 0) return null
    const savings = calculateYearlySavings(plan.price, plan.yearlyPrice)
    if (savings <= 0) return null
    return `Save $${savings}/year`
  }

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="h-5 w-5 text-[var(--text-1)] mx-auto" /> : <X className="h-5 w-5 text-[var(--text-2)]/30 mx-auto" />
    }
    return <span className="text-sm text-[var(--text-1)]">{value}</span>
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Navigation (if needed inside page) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center space-x-4 mb-16">
          <Link href="/" className="p-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-white/10 rounded-lg transition-colors text-[var(--text-1)]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-[var(--text-2)]" />
            <span className="text-lg font-semibold text-[var(--text-1)]">Pricing & Plans</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl md:text-5xl font-bold text-[var(--text-1)] tracking-tight mb-4">
            Simple, transparent pricing
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg text-[var(--text-2)] mb-10 max-w-2xl mx-auto">
            From individual creators to large enterprises, we have the perfect plan to bring your voice cloning projects to life.
          </motion.p>
          
          {/* Billing Toggle */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center justify-center">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-lg flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[var(--text-2)] hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[var(--text-2)] hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${billingCycle === 'yearly' ? 'border-black/20 bg-black/5 text-black' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {subscriptionPlans.map((plan, index) => {
            const savings = getSavings(plan)
            const isPopular = plan.popular
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                className={`relative bg-[var(--surface)] rounded-2xl p-8 flex flex-col ${
                  isPopular 
                    ? 'border-2 border-white shadow-2xl shadow-white/5 transform md:-translate-y-4 md:hover:-translate-y-6' 
                    : 'border border-[var(--border)] hover:border-white/30 transform md:hover:-translate-y-2'
                } transition-all duration-300`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      {plan.badge || 'Most Popular'}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[var(--text-1)] mb-2">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-2)] h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-1)] tracking-tight">
                      {getPrice(plan) === 0 ? 'Free' : `$${getPrice(plan)}`}
                    </span>
                    {getPrice(plan) > 0 && (
                      <span className="text-[var(--text-2)] ml-2 text-sm">
                        /{billingCycle === 'yearly' ? 'year' : 'mo'}
                      </span>
                    )}
                  </div>
                  <div className="h-6 mt-1">
                    {savings && (
                      <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {savings}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-white flex-shrink-0 mr-3 opacity-80" />
                      <span className="text-sm text-[var(--text-2)] leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.price === 0 ? "/signup" : "/billing"}
                  className={`w-full flex justify-center py-3 px-6 rounded-lg font-medium transition-all ${
                    isPopular
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-black border border-[var(--border)] text-[var(--text-1)] hover:bg-white/5 hover:border-white/30'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name} Plan`}
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-1)]">Compare All Features</h2>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 border-b border-[var(--border)] text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider w-1/4">Features</th>
                    {subscriptionPlans.map((plan) => (
                      <th key={plan.id} className="p-6 border-b border-[var(--border)] text-center text-sm font-semibold text-[var(--text-1)] w-1/4">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {features.map((feature, index) => (
                    <tr key={feature.name} className={`transition-colors hover:bg-white/[0.02] ${index % 2 === 0 ? 'bg-black/20' : 'bg-transparent'}`}>
                      <td className="p-6 text-sm font-medium text-[var(--text-1)]">
                        {feature.name}
                      </td>
                      <td className="p-6 text-center">
                        {renderFeatureValue(feature.starter)}
                      </td>
                      <td className="p-6 text-center">
                        {renderFeatureValue(feature.pro)}
                      </td>
                      <td className="p-6 text-center">
                        {renderFeatureValue(feature.enterprise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 border-y border-[var(--border)] py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[var(--text-1)]" />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-1)] mb-1">Secure & Private</div>
              <div className="text-sm text-[var(--text-2)] max-w-[200px]">End-to-end encryption for all your voice data.</div>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-[var(--text-1)]" />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-1)] mb-1">Global Infrastructure</div>
              <div className="text-sm text-[var(--text-2)] max-w-[200px]">99.9% uptime guarantee with low latency nodes.</div>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <Rocket className="h-6 w-6 text-[var(--text-1)]" />
            </div>
            <div>
              <div className="font-semibold text-[var(--text-1)] mb-1">Lightning Fast</div>
              <div className="text-sm text-[var(--text-2)] max-w-[200px]">Real-time audio processing and generation.</div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-24">
          <h2 className="text-2xl font-bold text-[var(--text-1)] text-center mb-10">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 hover:border-white/20 transition-colors">
              <h3 className="font-semibold text-[var(--text-1)] mb-3">Can I change my plan at any time?</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be charged pro-rated amounts automatically.
              </p>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 hover:border-white/20 transition-colors">
              <h3 className="font-semibold text-[var(--text-1)] mb-3">Do you offer refunds?</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                We offer a 30-day money-back guarantee for all paid plans. If you are not satisfied with the quality of the generated audio, contact our support team.
              </p>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 hover:border-white/20 transition-colors">
              <h3 className="font-semibold text-[var(--text-1)] mb-3">What happens if I exceed my limits?</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                We'll notify you via email when you reach 80% and 100% of your usage limits. You can easily upgrade your plan or purchase one-off additional usage credits.
              </p>
            </div>
            
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 hover:border-white/20 transition-colors">
              <h3 className="font-semibold text-[var(--text-1)] mb-3">Is there an Enterprise trial?</h3>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">
                Yes, absolutely! Please contact our sales team to arrange a custom Enterprise trial with full API access and all premium features unlocked.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="bg-white rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-black tracking-tight mb-4">
              Ready to Clone Your Voice?
            </h2>
            <p className="text-lg text-black/70 mb-8 max-w-2xl mx-auto">
              Join thousands of creators, businesses, and developers who trust our platform for their ethical voice cloning needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-black text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-black/90 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border border-black/20 text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-black/5 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-black/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/[0.03] rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </div>
  )
}