'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen" style={{ background: '#0f0f0f' }}>
        {children}
      </main>
    </div>
  )
}
