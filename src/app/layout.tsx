import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InterpretReflect - Wellness Platform for Interpreters',
  description: 'The wellness platform for ASL interpreters. Prevent burnout, manage vicarious trauma, and maintain healthy boundaries. RID-approved CEUs available.',
  keywords: ['ASL interpreter', 'interpreter wellness', 'burnout prevention', 'RID CEUs', 'vicarious trauma', 'interpreter training'],
  authors: [{ name: 'Building Bridges Global' }],
  themeColor: '#5C7F4F',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InterpretReflect',
  },
  openGraph: {
    type: 'website',
    siteName: 'InterpretReflect',
    title: 'InterpretReflect - Wellness Platform for Interpreters',
    description: 'Prevent burnout, manage vicarious trauma, earn RID CEUs.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterpretReflect - Wellness Platform for Interpreters',
    description: 'Prevent burnout, manage vicarious trauma, earn RID CEUs.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
