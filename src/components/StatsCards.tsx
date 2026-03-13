'use client'

import { formatNumber } from '@/lib/utils'

interface StatsCardsProps {
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  platform?: 'tiktok' | 'instagram' | 'all'
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accent: string
  accentBg: string
  trend?: string
}

function StatCard({ label, value, icon, accent, accentBg, trend }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: '#1a1a1a', border: '1px solid #242424' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: '#7a7a7a' }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: accentBg }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: '#f5f5f5' }}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {trend && (
          <p className="text-xs mt-1" style={{ color: '#5a5a5a' }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}

export default function StatsCards({
  totalVideos,
  totalViews,
  totalLikes,
  totalComments,
  totalShares,
  platform = 'all',
}: StatsCardsProps) {
  const accent = platform === 'tiktok' ? '#ff0050' : platform === 'instagram' ? '#c084fc' : '#06b6d4'
  const accentBg =
    platform === 'tiktok'
      ? 'rgba(255,0,80,0.12)'
      : platform === 'instagram'
      ? 'rgba(192,132,252,0.12)'
      : 'rgba(6,182,212,0.12)'

  const cards = [
    {
      label: 'Total Videos',
      value: totalVideos,
      icon: <VideoIcon />,
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: <EyeIcon />,
    },
    {
      label: 'Total Likes',
      value: totalLikes,
      icon: <HeartIcon />,
    },
    {
      label: 'Total Comments',
      value: totalComments,
      icon: <CommentIcon />,
    },
    {
      label: 'Total Shares',
      value: totalShares,
      icon: <ShareIcon />,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          accent={accent}
          accentBg={accentBg}
        />
      ))}
    </div>
  )
}

function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
