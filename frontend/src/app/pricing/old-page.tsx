'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Header from '../../components/layout/Header'

interface PricingPlan {
  name: string
  price: number
  billing: 'monthly' | 'yearly'
  popular?: boolean
  description: string
  features: string[]
  limits: {
    voiceClones: number
    monthlyGeneration: string
    audioQuality: string
    supportLevel: string
  }
  buttonText: string
  buttonStyle: string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const plans: PricingPlan[] = [
    {
      name: 'Free',
      price: 0,
      billing: billingCycle,
      description: 'Perfect for trying out voice cloning',
      features: [
        'Up to 2 voice clones',
        '10 minutes of audio generation per month',
        'Basic audio quality (22kHz)',
        'Community support',
        'Watermarked audio',
        'Personal use only'
      ],
      limits: {
        voiceClones: 2,
        monthlyGeneration: '10 minutes',
        audioQuality: 'Basic (22kHz)',
        supportLevel: 'Community'
      },
      buttonText: 'Get Started Free',
      buttonStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    },
    {
      name: 'Creator',
      price: billingCycle === 'monthly' ? 29 : 290,
      billing: billingCycle,
      popular: true,
      description: 'Ideal for content creators and small projects',
      features: [
        'Up to 10 voice clones',
        '5 hours of audio generation per month',
        'High audio quality (44kHz)',
        'Priority email support',
        'Optional watermarking',
        'Commercial use allowed',
        'Basic emotion control',
        'Export in multiple formats'
      ],
      limits: {
        voiceClones: 10,
        monthlyGeneration: '5 hours',
        audioQuality: 'High (44kHz)',
        supportLevel: 'Priority Email'
      },
      buttonText: 'Start Creator Plan',
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700'
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? 99 : 990,
      billing: billingCycle,
      description: 'For businesses and professional voice actors',
      features: [
        'Up to 50 voice clones',
        '20 hours of audio generation per month',
        'Premium audio quality (48kHz)',
        'Priority chat support',
        'No watermarking',
        'Full commercial rights',
        'Advanced emotion control',
        'Custom voice training',
        'API access',
        'Team collaboration tools'
      ],
      limits: {
        voiceClones: 50,
        monthlyGeneration: '20 hours',
        audioQuality: 'Premium (48kHz)',
        supportLevel: 'Priority Chat'
      },
      buttonText: 'Go Professional',
      buttonStyle: 'bg-purple-600 text-white hover:bg-purple-700'
    },
    {
      name: 'Enterprise',
      price: 299,
      billing: billingCycle,
      description: 'Custom solutions for large organizations',
      features: [
        'Unlimited voice clones',
        'Unlimited audio generation',
        'Studio quality (96kHz)',
        'Dedicated account manager',
        'White-label solution',
        'Custom integrations',
        'On-premise deployment option',
        'Advanced security features',
        'SLA guarantee',
        'Custom voice models'
      ],
      limits: {
        voiceClones: 999,
        monthlyGeneration: 'Unlimited',
        audioQuality: 'Studio (96kHz)',
        supportLevel: 'Dedicated Manager'
      },
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600'
    }
  ]

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCardIcon,
      description: 'Visa, Mastercard, American Express',
      popular: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: BanknotesIcon,
      description: 'Pay with your PayPal account',
      popular: true
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: DevicePhoneMobileIcon,
      description: 'Google Pay, PhonePe, Paytm',
      popular: false
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: BanknotesIcon,
      description: 'All major Indian banks',
      popular: false
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: DevicePhoneMobileIcon,
      description: 'Paytm, Amazon Pay, etc.',
      popular: false
    }
  ]

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName)
    if (planName !== 'Free') {
      setShowPaymentModal(true)
    }
  }

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Choose Payment Method</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{selectedPlan} Plan</h4>
            <p className="text-2xl font-bold text-primary-600">
              ${plans.find(p => p.name === selectedPlan)?.price}
              <span className="text-sm text-gray-500">/{billingCycle}</span>
            </p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="border rounded-lg p-4 hover:border-primary-500 cursor-pointer transition-colors"
                onClick={() => {
                  // Handle payment method selection
                  console.log(`Selected ${method.name} for ${selectedPlan} plan`)
                  alert(`Payment integration would be implemented here for ${method.name}`)
                }}
              >
                <div className="flex items-center space-x-3">
                  <method.icon className="h-6 w-6 text-gray-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{method.name}</h5>
                      {method.popular && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secured by industry-standard encryption. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Pricing Plans" 
        subtitle="Choose the perfect plan for your voice cloning needs"
        backLink="/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-red-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-white">
                  <path 
                    fill="currentColor" 
                    d="M50 20c-8 0-15 5-18 12-2 4-1 8 1 12l15 25c1 2 3 3 5 3s4-1 5-3l15-25c2-4 3-8 1-12-3-7-10-12-18-12z"
                  />
                  <path 
                    fill="currentColor" 
                    opacity="0.7"
                    d="M30 35c-3-2-7-3-10-1-5 3-7 9-4 14l10 15c1 2 3 3 5 2s3-3 2-5L23 45c-1-2 0-4 2-5s4 0 5 2l8 12c1 2 3 3 5 2s3-3 2-5L35 41c-2-3-3-5-5-6z"
                  />
                  <path 
                    fill="currentColor" 
                    opacity="0.7"
                    d="M70 35c3-2 7-3 10-1 5 3 7 9 4 14l-10 15c-1 2-3 3-5 2s-3-3-2-5l10-15c1-2 0-4-2-5s-4 0-5 2l-8 12c-1 2-3 3-5 2s-3-3-2-5l10-15c2-3 3-5 5-6z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">VCAAS - Voice Cloning as a Service</h1>
          <p className="text-lg text-gray-600 mt-2">Created by <span className="font-semibold text-primary-600">Ritesh Kumar Mishra</span></p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary-600 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  <StarIcon className="w-3 h-3 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{billingCycle}</span>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full mt-6 px-4 py-2 rounded-md text-sm font-medium transition-colors ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Feature Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Voice Clones</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 py-4 text-sm text-gray-600 text-center">
                      {plan.limits.voiceClones === 999 ? 'Unlimited' : plan.limits.voiceClones}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Generation</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 py-4 text-sm text-gray-600 text-center">
                      {plan.limits.monthlyGeneration}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Audio Quality</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 py-4 text-sm text-gray-600 text-center">
                      {plan.limits.audioQuality}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Support Level</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 py-4 text-sm text-gray-600 text-center">
                      {plan.limits.supportLevel}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-red-500 rounded-full"></div>
            </div>
            <p className="text-gray-600">
              Powered by <span className="font-semibold text-gray-900">Ritesh Kumar Mishra</span>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            All plans include industry-leading security and privacy protection
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  )
}
