import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindCanvas — Turn a single idea into an executable visual workspace',
  description: 'MindCanvas is an AI-powered infinite visual workspace that transforms any idea into a structured, interconnected, and actionable knowledge canvas.',
  keywords: ['AI workspace', 'mind map', 'canvas', 'idea management', 'visual thinking', 'startup', 'strategy'],
  authors: [{ name: 'MindCanvas' }],
  openGraph: {
    title: 'MindCanvas — AI-Powered Visual Workspace',
    description: 'Turn any idea into a fully structured, interactive canvas with AI-generated nodes, connections, and strategic insights.',
    type: 'website',
    siteName: 'MindCanvas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindCanvas — AI-Powered Visual Workspace',
    description: 'Transform ideas into actionable canvases with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080810',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div className="animated-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
