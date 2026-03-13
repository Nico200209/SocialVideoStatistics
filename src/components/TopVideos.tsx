'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { VideoWithLatestStat } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'
import PlatformBadge from './PlatformBadge'

interface TopVideosProps {
  videos: VideoWithLatestStat[]
  title?: string
}

export default function TopVideos({ videos, title = 'Top Performing Videos' }: TopVideosProps) {
  const sorted = [...videos]
    .filter((v) => v.latestStat !== null)
    .sort((a, b) => (b.latestStat?.views ?? 0) - (a.latestStat?.views ?? 0))
    .slice(0, 5)

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#1a1a1a', border: '1px solid #242424' }}
    >
      <h2 className="text-sm font-semibold mb-4" style={{ color: '#f5f5f5' }}>
        {title}
      </h2>
      {sorted.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: '#4a4a4a' }}>
          No videos tracked yet
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((video, idx) => (
            <TopVideoRow key={video.id} video={video} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function TopVideoRow({ video, rank }: { video: VideoWithLatestStat; rank: number }) {
  const [imageError, setImageError] = useState(false)
  const stat = video.latestStat

  const rankColors = ['#f59e0b', '#9ca3af', '#b45309']
  const rankColor = rank <= 3 ? rankColors[rank - 1] : '#3a3a3a'

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer group"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Rank */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ color: rankColor, background: rankColor + '18' }}
      >
        {rank}
      </div>

      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative"
        style={{ background: '#111' }}
      >
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: '#e0e0e0' }}>
          {video.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: '#5a5a5a' }}>
            {video.clientName}
          </span>
          <PlatformBadge platform={video.platform} size="sm" />
        </div>
      </div>

      {/* Views */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: '#f0f0f0' }}>
          {formatNumber(stat?.views ?? 0)}
        </p>
        <p className="text-xs" style={{ color: '#4a4a4a' }}>
          views
        </p>
      </div>
    </a>
  )
}
