'use client'

import { ChartBarIcon, MicrophoneIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface StatProps {
  title: string
  value: string | number
  change: string
  icon: React.ElementType
  changeType: 'increase' | 'decrease' | 'neutral'
}

function Stat({ title, value, change, icon: Icon, changeType }: StatProps) {
  const changeColor = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType]

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${changeColor}`}>{change}</span>
          <span className="text-gray-500"> from last month</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Voices',
      value: 3,
      change: '+2',
      icon: MicrophoneIcon,
      changeType: 'increase' as const
    },
    {
      title: 'Audio Generated',
      value: '47 mins',
      change: '+12.5%',
      icon: ChartBarIcon,
      changeType: 'increase' as const
    },
    {
      title: 'License Revenue',
      value: '$324.00',
      change: '+4.2%',
      icon: CurrencyDollarIcon,
      changeType: 'increase' as const
    },
    {
      title: 'Active Users',
      value: 12,
      change: '+8',
      icon: UsersIcon,
      changeType: 'increase' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Stat key={index} {...stat} />
      ))}
    </div>
  )
}
