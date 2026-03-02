import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CustomCursor } from '@/components/custom-cursor'
import { PageTransition } from '@/components/page-transition'
import { ScrollToTop } from '@/components/scroll-to-top'
import { TerminalEasterEgg } from '@/components/terminal-easter-egg'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: {
    default: 'RejectModders | Cybersecurity Developer',
    template: '%s | RejectModders',
  },
  description: 'Cybersecurity-focused developer from Missouri. Building security tools, writing code in Python, C, C++ and C#. Founder of Disutils & VulnRadar.',
  keywords: ['cybersecurity', 'developer', 'python', 'security tools', 'RejectModders', 'VulnRadar', 'Disutils'],
  authors: [{ name: 'RejectModders' }],
  icons: {
    icon: [
      { url: '/avatar.png', sizes: '32x32' },
      { url: '/avatar.png', sizes: '64x64' },
      { url: '/avatar.png', sizes: '192x192' },
    ],
    shortcut: '/avatar.png',
    apple: '/avatar.png',
  },
  openGraph: {
    title: 'RejectModders | Cybersecurity Developer',
    description: 'Cybersecurity-focused developer from Missouri. Building security tools and writing code.',
    type: 'website',
    url: 'https://rejectmodders.is-a.dev',
    siteName: 'RejectModders',
    images: [
      {
        url: '/avatar.png',
        width: 192,
        height: 192,
        alt: 'RejectModders Avatar',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RejectModders | Cybersecurity Developer',
    description: 'Cybersecurity-focused developer from Missouri. Building security tools and writing code.',
    images: ['/avatar.png'],
  },
  other: {
    'theme-color': '#dc2626',
  },
}

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="relative font-sans antialiased noise-bg cursor-none">
        <CustomCursor />
        <TerminalEasterEgg />
        <ScrollToTop />
        <PageTransition>
          {children}
        </PageTransition>
        <Analytics />
      </body>
    </html>
  )
}
