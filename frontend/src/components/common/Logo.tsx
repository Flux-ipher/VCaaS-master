'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon-only' | 'text-only'
  className?: string
  showText?: boolean
  textColor?: 'dark' | 'light'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl', 
  xl: 'text-2xl'
}

export default function Logo({ 
  size = 'md', 
  variant = 'full',
  className = '',
  showText = true,
  textColor = 'dark'
}: LogoProps) {
  const logoSize = sizeClasses[size]
  const textSize = textSizeClasses[size]
  const textColorClass = textColor === 'light' ? 'text-white' : 'text-gray-900'

  if (variant === 'text-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`font-bold ${textSize} ${textColorClass}`}>
          VCAAS
        </span>
        <span className={`ml-2 text-sm ${textColor === 'light' ? 'text-gray-300' : 'text-gray-600'} hidden sm:inline`}>
          Voice Cloning as a Service
        </span>
      </div>
    )
  }

  if (variant === 'icon-only') {
    return (
      <div className={`${logoSize} ${className}`}>
        <Image
          src="/phoenix-logo.svg"
          alt="Phoenix Logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    )
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center ${className}`}>
      <div className={logoSize}>
        <Image
          src="/phoenix-logo.svg"
          alt="Phoenix Logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <>
          <span className={`ml-2 font-bold ${textSize} ${textColorClass}`}>
            VCAAS
          </span>
          <span className={`ml-2 text-sm ${textColor === 'light' ? 'text-gray-300' : 'text-gray-600'} hidden sm:inline`}>
            Voice Cloning as a Service
          </span>
        </>
      )}
    </div>
  )
}
