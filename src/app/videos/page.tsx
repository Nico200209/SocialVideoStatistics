'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { VideoWithLatestStat, Stat } from '@/types'
import VideoGrid from '@/components/VideoGrid'
import AddVideoModal from '@/components/AddVideoModal'
import UpdateStatsModal from '@/components/UpdateStatsModal'

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoWithLatestStat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState<'all' | 'tiktok' | 'instagram'>('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoWithLatestStat | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      if (Array.isArray(data)) setVideos(data)
    } catch (err) {
      console.error('Failed to load videos', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const allClients = useMemo(
    () => Array.from(new Set(videos.map((v) => v.clientName))).sort(),
    [videos]
  )

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchesPlatform = platformFilter === 'all' || v.platform === platformFilter
      const matchesClient = clientFilter === 'all' || v.clientName === clientFilter
      const matchesSearch =
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.clientName.toLowerCase().includes(search.toLowerCase())
      return matchesPlatform && matchesClient && matchesSearch
    })
  }, [videos, platformFilter, clientFilter, search])

  const handleAddSuccess = (video: VideoWithLatestStat) => {
    setVideos((prev) => [video, ...prev])
  }

  const handleUpdateSuccess = (videoId: string, newStat: Stat) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, latestStat: newStat, stats: [newStat, ...v.stats], updatedAt: new Date().toISOString() }
          : v
      )
    )
  }

  const handleDelete = (id: string) => {
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

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'instagram', label: 'Instagram' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.12)' }}
          >
            <GridIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f5f5f5' }}>
              All Videos
            </h1>
            <p className="text-sm" style={{ color: '#5a5a5a' }}>
              {loading ? 'Loading…' : `${videos.length} video${videos.length !== 1 ? 's' : ''} tracked`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: '#06b6d4', color: '#000' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <PlusIcon />
          Add Video
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-2xl"
        style={{ background: '#1a1a1a', border: '1px solid #242424' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a4a4a' }}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by title or client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
          />
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#141414', border: '1px solid #222' }}>
          {platformOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlatformFilter(opt.value as typeof platformFilter)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                platformFilter === opt.value
                  ? { background: '#06b6d4', color: '#000' }
                  : { color: '#6a6a6a' }
              }
              onMouseEnter={(e) => {
                if (platformFilter !== opt.value) e.currentTarget.style.color = '#c0c0c0'
              }}
              onMouseLeave={(e) => {
                if (platformFilter !== opt.value) e.currentTarget.style.color = '#6a6a6a'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Client filter */}
        {allClients.length > 0 && (
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              color: clientFilter === 'all' ? '#6a6a6a' : '#f0f0f0',
              colorScheme: 'dark',
            }}
          >
            <option value="all">All Clients</option>
            {allClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* Results count */}
        {!loading && (
          <span className="text-xs ml-auto" style={{ color: '#4a4a4a' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-64 animate-pulse"
              style={{ background: '#1a1a1a', border: '1px solid #242424' }}
            />
          ))}
        </div>
      ) : (
        <VideoGrid
          videos={filtered}
          onUpdate={handleOpenUpdate}
          onDelete={handleDelete}
          emptyMessage={
            search || platformFilter !== 'all' || clientFilter !== 'all'
              ? 'No videos match your filters'
              : 'No videos tracked yet'
          }
        />
      )}

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
            <h3 className="text-base font-semibold mb-1" style={{ color: '#f5f5f5' }}>Delete Video?</h3>
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

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="0.5" />
      <rect x="14" y="3" width="7" height="7" rx="0.5" />
      <rect x="3" y="14" width="7" height="7" rx="0.5" />
      <rect x="14" y="14" width="7" height="7" rx="0.5" />
    </svg>
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

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
