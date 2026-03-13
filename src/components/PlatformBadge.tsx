'use client'

import type { Platform } from '@/types'

interface PlatformBadgeProps {
  platform: Platform
  size?: 'sm' | 'md'
}

export default function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
  const isSmall = size === 'sm'

  if (platform === 'tiktok') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full
          ${isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
        `}
        style={{ background: 'rgba(255,0,80,0.15)', color: '#ff0050', border: '1px solid rgba(255,0,80,0.3)' }}
      >
        <TikTokIcon size={isSmall ? 10 : 12} />
        TikTok
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full
        ${isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
      `}
      style={{
        background: 'rgba(131,58,180,0.15)',
        color: '#c084fc',
        border: '1px solid rgba(131,58,180,0.3)',
      }}
    >
      <InstagramIcon size={isSmall ? 10 : 12} />
      Instagram
    </span>
  )
}

function TikTokIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.28 8.28 0 004.84 1.54V7.05a4.84 4.84 0 01-1.07-.36z" />
    </svg>
  )
}

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}
