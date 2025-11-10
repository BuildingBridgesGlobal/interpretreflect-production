import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InterpretReflect - Performance Optimization for Interpreters',
  description: 'The performance optimization platform for ASL interpreters. Build sustainable capacity, optimize cognitive load, and elevate your career. RID-approved CEUs available.',
  keywords: ['ASL interpreter', 'interpreter performance', 'professional development', 'RID CEUs', 'capacity building', 'interpreter training', 'cognitive optimization'],
  authors: [{ name: 'Building Bridges Global' }],
  themeColor: '#2B5F75',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InterpretReflect',
  },
  openGraph: {
    type: 'website',
    siteName: 'InterpretReflect',
    title: 'InterpretReflect - Performance Optimization for Interpreters',
    description: 'Build sustainable capacity, optimize performance, earn RID CEUs.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterpretReflect - Performance Optimization for Interpreters',
    description: 'Build sustainable capacity, optimize performance, earn RID CEUs.',
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
