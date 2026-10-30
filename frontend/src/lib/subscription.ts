// Subscription and billing system without external payment providers
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    voices: number | 'unlimited'
    minutes: number
    storage: string
    quality: 'Basic' | 'High' | 'Premium'
    support: string
  }
  popular: boolean
  color: 'gray' | 'primary' | 'accent'
  badge?: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: string
  endDate: string
  billingCycle: 'monthly' | 'yearly'
  autoRenew: boolean
  trialEndsAt?: string
  cancelledAt?: string
}

export interface UsageData {
  userId: string
  currentPeriod: {
    startDate: string
    endDate: string
    voicesUsed: number
    minutesUsed: number
    storageUsed: string
    apiCalls: number
  }
  limits: {
    voices: number | 'unlimited'
    minutes: number
    storage: string
  }
  percentageUsed: {
    voices: number
    minutes: number
    storage: number
  }
}

export interface Invoice {
  id: string
  userId: string
  planId: string
  amount: number
  status: 'paid' | 'pending' | 'failed' | 'cancelled'
  createdAt: string
  dueDate: string
  paidAt?: string
  description: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

// Subscription plans configuration
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: 0,
    yearlyPrice: 0,
    interval: 'month',
    features: [
      '3 voice models',
      '60 minutes/month',
      'Basic voice quality',
      '1GB storage',
      'Community support',
      'Standard processing speed',
      'Basic export formats'
    ],
    limits: {
      voices: 3,
      minutes: 60,
      storage: '1GB',
      quality: 'Basic',
      support: 'Community'
    },
    popular: false,
    color: 'gray'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for professionals and growing businesses',
    price: 29,
    yearlyPrice: 290, // ~17% discount
    interval: 'month',
    features: [
      '15 voice models',
      '500 minutes/month',
      'High-quality voices',
      '10GB storage',
      'Priority support',
      'Fast processing',
      'API access',
      'Custom voice training',
      'Advanced export formats',
      'Voice cloning from samples'
    ],
    limits: {
      voices: 15,
      minutes: 500,
      storage: '10GB',
      quality: 'High',
      support: 'Priority'
    },
    popular: true,
    color: 'primary',
    badge: 'Most Popular'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and high-volume usage',
    price: 99,
    yearlyPrice: 990, // ~17% discount
    interval: 'month',
    features: [
      'Unlimited voice models',
      '2500 minutes/month',
      'Premium voice quality',
      '100GB storage',
      '24/7 dedicated support',
      'Ultra-fast processing',
      'Full API access',
      'Custom integrations',
      'Advanced analytics',
      'White-label options',
      'Custom voice training',
      'Bulk voice generation',
      'Priority queue',
      'SLA guarantee'
    ],
    limits: {
      voices: 'unlimited',
      minutes: 2500,
      storage: '100GB',
      quality: 'Premium',
      support: '24/7 Dedicated'
    },
    popular: false,
    color: 'accent',
    badge: 'Best Value'
  }
]

// Helper functions
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === planId)
}

export const formatPrice = (price: number, billingCycle: 'monthly' | 'yearly' = 'monthly'): string => {
  if (price === 0) return 'Free'
  
  if (billingCycle === 'yearly') {
    return `$${price}/year`
  }
  return `$${price}/month`
}

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyEquivalent = monthlyPrice * 12
  return yearlyEquivalent - yearlyPrice
}

export const getUsagePercentage = (used: number, limit: number | 'unlimited'): number => {
  if (limit === 'unlimited') return 0
  return Math.min((used / limit) * 100, 100)
}

export const getStorageUsageInGB = (storageString: string): number => {
  const match = storageString.match(/^(\d+\.?\d*)\s*(GB|MB|KB)?$/i)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = match[2]?.toUpperCase() || 'GB'
  
  switch (unit) {
    case 'KB': return value / (1024 * 1024)
    case 'MB': return value / 1024
    case 'GB': return value
    default: return value
  }
}

export const formatStorage = (sizeInGB: number): string => {
  if (sizeInGB < 0.01) {
    return `${Math.round(sizeInGB * 1024 * 1024)} KB`
  } else if (sizeInGB < 1) {
    return `${Math.round(sizeInGB * 1024)} MB`
  } else {
    return `${sizeInGB.toFixed(1)} GB`
  }
}

// Mock data generators for development
export const generateMockUserSubscription = (userId: string): UserSubscription => {
  return {
    id: `sub_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId: 'pro',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    billingCycle: 'yearly',
    autoRenew: true,
    trialEndsAt: undefined,
    cancelledAt: undefined
  }
}

export const generateMockUsageData = (userId: string): UsageData => {
  return {
    userId,
    currentPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      voicesUsed: 8,
      minutesUsed: 245,
      storageUsed: '3.2GB',
      apiCalls: 1247
    },
    limits: {
      voices: 15,
      minutes: 500,
      storage: '10GB'
    },
    percentageUsed: {
      voices: 53, // 8/15
      minutes: 49, // 245/500
      storage: 32  // 3.2/10
    }
  }
}

export const generateMockInvoices = (userId: string): Invoice[] => {
  return [
    {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId: 'pro',
      amount: 290,
      status: 'paid',
      createdAt: '2024-01-15',
      dueDate: '2024-01-15',
      paidAt: '2024-01-15',
      description: 'Pro Plan - Yearly Subscription',
      items: [
        {
          description: 'Pro Plan (Yearly)',
          quantity: 1,
          unitPrice: 290,
          totalPrice: 290
        }
      ]
    },
    {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId: 'pro',
      amount: 29,
      status: 'paid',
      createdAt: '2023-12-15',
      dueDate: '2023-12-15',
      paidAt: '2023-12-15',
      description: 'Pro Plan - Monthly Subscription',
      items: [
        {
          description: 'Pro Plan (Monthly)',
          quantity: 1,
          unitPrice: 29,
          totalPrice: 29
        }
      ]
    }
  ]
}

export const generateMockPaymentMethods = (): PaymentMethod[] => {
  return [
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 'pm_2',
      type: 'paypal',
      isDefault: false
    }
  ]
}