'use client'

import { useState, useEffect, useCallback } from 'react'
import type { VideoWithLatestStat, Stat, Platform } from '@/types'
import StatsCards from './StatsCards'
import PerformanceChart from './PerformanceChart'
import TopVideos from './TopVideos'
import VideoGrid from './VideoGrid'
import AddVideoModal from './AddVideoModal'
import UpdateStatsModal from './UpdateStatsModal'

interface DashboardViewProps {
  platform?: Platform
  title: string
  subtitle: string
  accentColor: string
  headerIcon?: React.ReactNode
}

export default function DashboardView({
  platform,
  title,
  subtitle,
  accentColor,
  headerIcon,
}: DashboardViewProps) {
  const [videos, setVideos] = useState<VideoWithLatestStat[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoWithLatestStat | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const url = platform ? `/api/videos?platform=${platform}` : '/api/videos'
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
      }
    } catch (err) {
      console.error('Failed to fetch videos', err)
    } finally {
      setLoading(false)
    }
  }, [platform])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleAddSuccess = (video: VideoWithLatestStat) => {
    setVideos((prev) => [video, ...prev])
  }

  const handleUpdateSuccess = (videoId: string, newStat: Stat) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              latestStat: newStat,
              stats: [newStat, ...v.stats],
              updatedAt: new Date().toISOString(),
            }
          : v
      )
    )
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    try {
      await fetch(`/api/videos/${deleteConfirmId}`, { method: 'DELETE' })
      setVideos((prev) => prev.filter((v) => v.id !== deleteConfirmId))
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleOpenUpdate = (video: VideoWithLatestStat) => {
    setSelectedVideo(video)
    setUpdateModalOpen(true)
  }

  const totalStats = videos.reduce(
    (acc, v) => {
      const stat = v.latestStat
      return {
        totalViews: acc.totalViews + (stat?.views ?? 0),
        totalLikes: acc.totalLikes + (stat?.likes ?? 0),
        totalComments: acc.totalComments + (stat?.comments ?? 0),
        totalShares: acc.totalShares + (stat?.shares ?? 0),
      }
    },
    { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
  )

  const recentVideos = [...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6)

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {headerIcon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: accentColor + '18' }}
            >
              {headerIcon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f5f5f5' }}>
              {title}
            </h1>
            <p className="text-sm" style={{ color: '#5a5a5a' }}>
              {subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: accentColor, color: '#000' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <PlusIcon />
          Add Video
        </button>
      </div>

      {/* Stats cards */}
      {loading ? (
        <StatsCardsLoading />
      ) : (
        <StatsCards
          totalVideos={videos.length}
          totalViews={totalStats.totalViews}
          totalLikes={totalStats.totalLikes}
          totalComments={totalStats.totalComments}
          totalShares={totalStats.totalShares}
          platform={platform ?? 'all'}
        />
      )}

      {/* Chart + Top videos row */}
      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <PerformanceChart videos={videos} platform={platform ?? 'all'} />
          </div>
          <div>
            <TopVideos videos={videos} />
          </div>
        </div>
      )}

      {/* Recent videos */}
      {!loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
              Recent Videos
            </h2>
            <span className="text-xs" style={{ color: '#4a4a4a' }}>
              {videos.length} total
            </span>
          </div>
          <VideoGrid
            videos={recentVideos}
            onUpdate={handleOpenUpdate}
            onDelete={handleDelete}
            emptyMessage="No videos tracked yet"
          />
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {/* Modals */}
      <AddVideoModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      <UpdateStatsModal
        isOpen={updateModalOpen}
        video={selectedVideo}
        onClose={() => { setUpdateModalOpen(false); setSelectedVideo(null) }}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-slide-up"
            style={{ background: '#161616', border: '1px solid #2a2a2a' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(239,68,68,0.12)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: '#f5f5f5' }}>
              Delete Video?
            </h3>
            <p className="text-sm mb-5" style={{ color: '#7a7a7a' }}>
              This will permanently delete the video and all its stat history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#1e1e1e', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#242424' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#ef4444', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function StatsCardsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 h-24 animate-pulse"
          style={{ background: '#1a1a1a', border: '1px solid #242424' }}
        />
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl h-72 animate-pulse" style={{ background: '#1a1a1a', border: '1px solid #242424' }} />
        <div className="rounded-2xl h-72 animate-pulse" style={{ background: '#1a1a1a', border: '1px solid #242424' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: '#1a1a1a', border: '1px solid #242424' }} />
        ))}
      </div>
    </div>
  )
}
