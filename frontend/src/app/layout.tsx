import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Providers } from '../components/providers/Providers'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'VCaaS — Voice Clone as a Service',
  description:
    'Professional voice cloning platform with ethical licensing, 6-layer deepfake detection, acoustic watermarking, and developer-first APIs.',
  keywords: [
    'voice cloning', 'TTS', 'AI voice', 'voice synthesis',
    'creator tools', 'licensing', 'watermarking', 'voice API',
  ],
  authors: [{ name: 'VCaaS' }],
  openGraph: {
    title: 'VCaaS — Voice Clone as a Service',
    description: 'Professional voice cloning with ethical licensing and watermarking.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
