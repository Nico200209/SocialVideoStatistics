'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: DashboardIcon,
    activeColor: '#06b6d4',
    activeBg: 'rgba(6,182,212,0.1)',
    activeBorder: 'rgba(6,182,212,0.3)',
  },
  {
    href: '/tiktok',
    label: 'TikTok',
    icon: TikTokIcon,
    activeColor: '#ff0050',
    activeBg: 'rgba(255,0,80,0.1)',
    activeBorder: 'rgba(255,0,80,0.3)',
  },
  {
    href: '/instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    activeColor: '#c084fc',
    activeBg: 'rgba(192,132,252,0.1)',
    activeBorder: 'rgba(192,132,252,0.3)',
  },
  {
    href: '/videos',
    label: 'All Videos',
    icon: GridIcon,
    activeColor: '#06b6d4',
    activeBg: 'rgba(6,182,212,0.1)',
    activeBorder: 'rgba(6,182,212,0.3)',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40"
      style={{ background: '#111111', borderRight: '1px solid #1e1e1e' }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#f5f5f5' }}>
              VideoDash
            </p>
            <p className="text-xs" style={{ color: '#6b6b6b' }}>
              Performance Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 pb-2" style={{ color: '#4a4a4a' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={
                isActive
                  ? {
                      background: item.activeBg,
                      color: item.activeColor,
                      border: `1px solid ${item.activeBorder}`,
                    }
                  : {
                      color: '#7a7a7a',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#1e1e1e'
                  e.currentTarget.style.color = '#c0c0c0'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#7a7a7a'
                }
              }}
            >
              <Icon
                size={18}
                color={isActive ? item.activeColor : 'currentColor'}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — user info + logout */}
      <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid #1e1e1e' }}>
        {session?.user && (
          <div className="flex items-center gap-2.5 px-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: '#fff' }}
            >
              {session.user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#d0d0d0' }}>
                {session.user.name}
              </p>
              <p className="text-xs truncate" style={{ color: '#4a4a4a' }}>
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: '#5a5a5a', background: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1e1e1e'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#5a5a5a'
          }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function DashboardIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function TikTokIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.28 8.28 0 004.84 1.54V7.05a4.84 4.84 0 01-1.07-.36z" />
    </svg>
  )
}

function InstagramIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function GridIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="0.5" />
      <rect x="10" y="3" width="5" height="5" rx="0.5" />
      <rect x="17" y="3" width="4" height="5" rx="0.5" />
      <rect x="3" y="10" width="5" height="5" rx="0.5" />
      <rect x="10" y="10" width="5" height="5" rx="0.5" />
      <rect x="17" y="10" width="4" height="5" rx="0.5" />
      <rect x="3" y="17" width="5" height="4" rx="0.5" />
      <rect x="10" y="17" width="5" height="4" rx="0.5" />
      <rect x="17" y="17" width="4" height="4" rx="0.5" />
    </svg>
  )
}
