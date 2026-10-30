'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Settings, LogOut, ChevronDown, LayoutDashboard, FileText } from 'lucide-react'
import { useAuthContext } from '@/components/providers/AuthProvider'

const NAV_LINKS: { label: string; href: string; authRequired?: boolean }[] = [
  { label: 'Live Demo',  href: '/live-demo'  },
  { label: 'Dashboard',  href: '/dashboard'  },
  { label: 'Playground', href: '/playground' },
  { label: 'Training',   href: '/training'   },
  { label: 'Watermark Tech', href: '/watermark' },
  { label: 'Pricing',    href: '/pricing'    },
]

export function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, isAuthenticated, loading, signOut } = useAuthContext()

  /* ── Scroll shadow ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Close menus on route change ──────────────── */
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false) }, [pathname])

  /* ── Close dropdown on outside click ─────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (href: string) => pathname === href

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    router.push('/')
  }

  /* ── Avatar helpers ───────────────────────────── */
  const avatarUrl   = user?.photoURL ?? null
  const displayName = user?.displayName ?? user?.email ?? 'User'
  const initials    = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      <header
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        style={{ borderBottom: scrolled ? undefined : '1px solid transparent' }}
      >
        <div className="container flex items-center h-full gap-8">

          {/* ── Logo ─────────────────────────────── */}
          <Link href="/" id="nav-logo" className="flex items-center gap-2 shrink-0" aria-label="VCaaS home">
            <Image src="/logo.png" alt="VCaaS" width={56} height={56} style={{ borderRadius: 8 }} priority />
          </Link>

          {/* ── Desktop Nav ──────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-4" aria-label="Main navigation">
            {[...NAV_LINKS, { label: 'Profile', href: '/profile', authRequired: true }].map(({ label, href, authRequired }) => {
              if (authRequired && !isAuthenticated) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive(href) ? '#0F172A' : '#475569',
                    textDecoration: 'none',
                    padding: '8px 14px',
                    borderRadius: 9999,
                    background: isActive(href) ? '#F1F5F9' : 'transparent',
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.color = '#0F172A'; (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; } }}
                  onMouseLeave={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ────────────────────── */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {loading ? (
              /* Skeleton while auth resolves */
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)' }} />
            ) : isAuthenticated ? (
              /* ── Profile Dropdown ── */
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  id="nav-profile-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 24,
                    padding: '4px 10px 4px 4px',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  aria-label="Profile menu"
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={28}
                      height={28}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>
                      {initials}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--text-1)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.displayName?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDown
                    size={13}
                    color="var(--text-3)"
                    style={{ transition: 'transform 150ms ease', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: 200,
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        zIndex: 200,
                      }}
                    >
                      {/* User info header */}
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{displayName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      {[
                        { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
                        { icon: FileText,        label: 'Licenses',    href: '/dashboard/licenses' },
                        { icon: User,            label: 'Profile',     href: '/profile'   },
                        { icon: Settings,        label: 'Settings',    href: '/settings'  },
                      ].map(({ icon: Icon, label, href }) => (
                        <Link
                          key={href}
                          href={href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 16px',
                            fontSize: 13,
                            color: 'var(--text-2)',
                            textDecoration: 'none',
                            transition: 'background 120ms ease, color 120ms ease',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-1)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-2)'
                          }}
                        >
                          <Icon size={14} />
                          {label}
                        </Link>
                      ))}

                      <div style={{ height: 1, background: 'var(--border)' }} />

                      {/* Sign out */}
                      <button
                        id="nav-sign-out"
                        onClick={handleSignOut}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: 13,
                          color: '#f87171',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 120ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest buttons ── */
              <>
                <Link
                  href="/login"
                  id="nav-sign-in"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0F172A',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: 9999,
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  id="nav-get-started"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 9999,
                    background: '#F59E0B',
                    color: '#0F172A',
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────── */}
          <button
            id="nav-mobile-toggle"
            className="md:hidden ml-auto btn-icon btn"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen
                ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.span>
                : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={18} /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Mobile Menu ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="nav-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
              background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
              padding: '16px',
            }}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: 15, fontWeight: 500,
                    color: isActive(href) ? '#0F172A' : '#475569',
                    textDecoration: 'none', padding: '12px 14px',
                    borderRadius: '8px',
                    background: isActive(href) ? '#F1F5F9' : 'transparent',
                    display: 'block', transition: 'background 150ms ease',
                  }}
                >
                  {label}
                </Link>
              ))}

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  {/* User info */}
                  <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={32} height={32} style={{ borderRadius: '50%' }} />
                    ) : (
                      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                        {initials}
                      </span>
                    )}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{displayName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{user?.email}</p>
                    </div>
                  </div>
                  <Link href="/profile"  className="btn btn-secondary" style={{ justifyContent: 'center' }}>Profile</Link>
                  <Link href="/settings" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Settings</Link>
                  <button onClick={handleSignOut} className="btn" style={{ justifyContent: 'center', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login"  className="btn btn-secondary" style={{ justifyContent: 'center' }}>Sign in</Link>
                  <Link href="/signup" className="btn btn-primary"   style={{ justifyContent: 'center' }}>Get Started</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}