'use client'

import type { VideoWithLatestStat } from '@/types'
import VideoCard from './VideoCard'

interface VideoGridProps {
  videos: VideoWithLatestStat[]
  onUpdate: (video: VideoWithLatestStat) => void
  onDelete: (id: string) => void
  emptyMessage?: string
}

export default function VideoGrid({ videos, onUpdate, onDelete, emptyMessage }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ border: '1px dashed #282828', background: '#111111' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#1a1a1a' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3a3a3a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
          {emptyMessage ?? 'No videos yet'}
        </p>
        <p className="text-xs mt-1" style={{ color: '#3a3a3a' }}>
          Add your first video using the button above
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}
