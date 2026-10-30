"use client"

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'|'system'>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as 'light'|'dark'|'system') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (t: 'light'|'dark'|'system') => {
      if (t === 'dark') {
        root.classList.add('dark')
        ;(root as any).dataset.theme = 'dark'
      } else if (t === 'light') {
        root.classList.remove('dark')
        ;(root as any).dataset.theme = 'light'
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) root.classList.add('dark')
        else root.classList.remove('dark')
        ;(root as any).dataset.theme = prefersDark ? 'dark' : 'light'
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const cycle = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'))
  }

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System'

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}`}
      className="btn-shine fixed z-50 top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-white/10 shadow backdrop-blur-md hover:opacity-95"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-yellow-300" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
      )}
    </button>
  )
}