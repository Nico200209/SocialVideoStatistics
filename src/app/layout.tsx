import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'VideoDash – Video Performance Tracker',
  description: 'Track TikTok and Instagram video performance for your clients',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ background: '#0f0f0f' }}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
