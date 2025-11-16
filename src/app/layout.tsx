import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import CursorAnimation from '@/components/CursorAnimation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InterpretReflect - Performance Optimization for Interpreters',
  description: 'The performance optimization platform for ASL interpreters. Build sustainable capacity, optimize cognitive load, and elevate your career. RID-approved CEUs available.',
  keywords: ['ASL interpreter', 'interpreter performance', 'professional development', 'RID CEUs', 'capacity building', 'interpreter training', 'cognitive optimization'],
  authors: [{ name: 'Building Bridges Global' }],
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

export const viewport = {
  themeColor: '#1E3A8A', // Professional dark blue
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "InterpretReflect",
            "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "foundingLocation": "North Carolina",
            "department": [
              { "@type": "Organization", "name": "Women-Owned Small Business" },
              { "@type": "Organization", "name": "Service-Disabled Veteran-Owned" }
            ],
            "knowsAbout": [
              "Interpreting performance optimization",
              "Ethical AI",
              "Neuroscience-based performance",
              "Trauma-informed design"
            ]
          })}
        </script>
      </head>
      <body className={inter.className}>
        <CursorAnimation />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
