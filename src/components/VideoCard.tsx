'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { VideoWithLatestStat } from '@/types'
import { formatNumber, formatDate, timeAgo } from '@/lib/utils'
import PlatformBadge from './PlatformBadge'

interface VideoCardProps {
  video: VideoWithLatestStat
  onUpdate: (video: VideoWithLatestStat) => void
  onDelete: (id: string) => void
}

export default function VideoCard({ video, onUpdate, onDelete }: VideoCardProps) {
  const [imageError, setImageError] = useState(false)
  const stat = video.latestStat

  const stats = [
    { label: 'Views', value: stat?.views ?? 0, icon: '👁' },
    { label: 'Likes', value: stat?.likes ?? 0, icon: '❤️' },
    { label: 'Comments', value: stat?.comments ?? 0, icon: '💬' },
    { label: 'Shares', value: stat?.shares ?? 0, icon: '🔁' },
  ]

  const accentColor = video.platform === 'tiktok' ? '#ff0050' : '#c084fc'

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-200"
      style={{
        background: '#1a1a1a',
        border: '1px solid #242424',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#333333'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#242424'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#111] overflow-hidden flex-shrink-0">
        {video.thumbnail && !imageError ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: accentColor + '22' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
          </div>
        )}

        {/* Platform overlay */}
        <div className="absolute top-2.5 left-2.5">
          <PlatformBadge platform={video.platform} size="sm" />
        </div>

        {/* Actions overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <button
            onClick={() => onUpdate(video)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: '#06b6d4', color: '#000' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0891b2' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#06b6d4' }}
          >
            <UpdateIcon size={12} />
            Update Stats
          </button>
          <button
            onClick={() => onDelete(video.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
          >
            <TrashIcon size={12} />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title + client */}
        <div>
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 mb-1"
            style={{ color: '#f0f0f0' }}
            title={video.title}
          >
            {video.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ background: '#242424', color: '#a0a0a0' }}
            >
              {video.clientName}
            </span>
            <span className="text-xs" style={{ color: '#4a4a4a' }}>
              {formatDate(video.datePosted)}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 py-2 rounded-lg"
              style={{ background: '#141414' }}
            >
              <span className="text-base leading-none">{s.icon}</span>
              <span className="text-xs font-bold" style={{ color: '#f0f0f0' }}>
                {formatNumber(s.value)}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: '#4a4a4a' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: '#4a4a4a' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = accentColor }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4a4a' }}
          >
            <LinkIcon size={10} />
            View
          </a>
          {stat && (
            <span className="text-xs" style={{ color: '#3a3a3a' }}>
              Updated {timeAgo(stat.recordedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function UpdateIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  )
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function LinkIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
