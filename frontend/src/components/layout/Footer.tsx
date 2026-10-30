'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #E2E8F0',
        padding: '64px 0 40px',
        background: '#FFFFFF',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 40,
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            {/* Brand */}
            <div className="max-w-xs">
              <Link
                href="/"
                className="flex items-center gap-3 mb-4"
                style={{ textDecoration: 'none' }}
                aria-label="VCaaS home"
              >
                <Image
                  src="/logo.png"
                  alt="VCaaS"
                  width={52}
                  height={52}
                  style={{ borderRadius: 10 }}
                  priority
                />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  VCaaS
                </span>
              </Link>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                Professional voice cloning platform with ethical licensing, 6-layer deepfake detection, acoustic watermarking, and developer-first APIs.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12 md:gap-24">
              <div className="flex flex-col gap-4">
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Product</h4>
                <nav className="flex flex-col gap-3" aria-label="Product navigation">
                  {[
                    { label: 'Live Demo',  href: '/live-demo' },
                    { label: 'Playground', href: '/playground' },
                    { label: 'Training',   href: '/training' },
                    { label: 'Pricing',    href: '/pricing' },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href} style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}>
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Resources</h4>
                <nav className="flex flex-col gap-3" aria-label="Resources navigation">
                  {[
                    { label: 'Documentation', href: '/docs' },
                    { label: 'Help Center',   href: '/help' },
                    { label: 'API Reference', href: '/docs' },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}>
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4">
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Legal</h4>
                <nav className="flex flex-col gap-3" aria-label="Legal navigation">
                  {[
                    { label: 'Privacy Policy', href: '/privacy' },
                    { label: 'Terms of Service', href: '/terms' },
                    { label: 'Licensing', href: '/licensing' },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href} style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}>
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: '#E2E8F0', width: '100%' }} />

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              © {new Date().getFullYear()} VCaaS. All rights reserved. Built for ethical voice creators.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}>Twitter</a>
              <a href="https://github.com/SyntaxisReaper/VCAAS" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color 150ms ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}>GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
