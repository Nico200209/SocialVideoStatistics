import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'VideoDash – Video Performance Tracker',
  description: 'Track TikTok and Instagram video performance for your clients',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ background: '#0f0f0f' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen" style={{ background: '#0f0f0f' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
