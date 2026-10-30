'use client'

import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Logo from '../common/Logo'

interface HeaderProps {
  title: string
  subtitle?: string
  backLink?: string
  icon?: React.ElementType
}

export default function Header({ title, subtitle, backLink, icon: Icon }: HeaderProps) {
  return (
    <div className="glass gradient-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {backLink && (
            <Link href={backLink} className="mr-3 p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          )}
          <div className="flex items-center">
            {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600 mr-2" />}
            <div>
              <h1 className="typewriter text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-emerald-500 to-cyan-500">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
