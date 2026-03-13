'use client'

import { useState, useEffect, useRef } from 'react'
import type { VideoWithLatestStat, Stat } from '@/types'
import { formatNumber } from '@/lib/utils'

interface UpdateStatsModalProps {
  isOpen: boolean
  video: VideoWithLatestStat | null
  onClose: () => void
  onSuccess: (videoId: string, newStat: Stat) => void
}

export default function UpdateStatsModal({ isOpen, video, onClose, onSuccess }: UpdateStatsModalProps) {
  const [views, setViews] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && video?.latestStat) {
      setViews(video.latestStat.views.toString())
      setLikes(video.latestStat.likes.toString())
      setComments(video.latestStat.comments.toString())
      setShares(video.latestStat.shares.toString())
    } else if (isOpen) {
      setViews('')
      setLikes('')
      setComments('')
      setShares('')
    }
    setError('')
  }, [isOpen, video])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/videos/${video.id}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          views: parseInt(views) || 0,
          likes: parseInt(likes) || 0,
          comments: parseInt(comments) || 0,
          shares: parseInt(shares) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to update stats')
        return
      }
      onSuccess(video.id, data as Stat)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !video) return null

  const accentColor = video.platform === 'tiktok' ? '#ff0050' : video.platform === 'instagram' ? '#c084fc' : '#06b6d4'
  const prev = video.latestStat

  const getDiff = (current: string, previous: number | undefined) => {
    const cur = parseInt(current) || 0
    const prev_ = previous ?? 0
    const diff = cur - prev_
    if (diff === 0) return null
    return { diff, positive: diff > 0 }
  }

  const statRows: Array<{ key: string; label: string; value: string; setter: (v: string) => void; prevVal: number | undefined; icon: string }> = [
    { key: 'views', label: 'Views', value: views, setter: setViews, prevVal: prev?.views, icon: '👁' },
    { key: 'likes', label: 'Likes', value: likes, setter: setLikes, prevVal: prev?.likes, icon: '❤️' },
    { key: 'comments', label: 'Comments', value: comments, setter: setComments, prevVal: prev?.comments, icon: '💬' },
    { key: 'shares', label: 'Shares', value: shares, setter: setShares, prevVal: prev?.shares, icon: '🔁' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl animate-slide-up"
        style={{ background: '#161616', border: '1px solid #2a2a2a', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>
              Update Stats
            </h2>
            <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#5a5a5a' }}>
              {video.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#1e1e1e', color: '#7a7a7a' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-xs" style={{ color: '#5a5a5a' }}>
            Enter the current stats. A new snapshot will be recorded to track growth.
          </p>

          <div className="space-y-3">
            {statRows.map((row) => {
              const diffInfo = getDiff(row.value, row.prevVal)
              return (
                <div key={row.key} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: '#1e1e1e' }}
                  >
                    {row.icon}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1" style={{ color: '#a0a0a0' }}>
                      {row.label}
                      {row.prevVal !== undefined && (
                        <span className="ml-2 font-normal" style={{ color: '#4a4a4a' }}>
                          prev: {formatNumber(row.prevVal)}
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.value}
                      onChange={(e) => row.setter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                    />
                  </div>
                  {diffInfo && (
                    <div
                      className="text-xs font-semibold flex-shrink-0 px-2 py-1 rounded-lg"
                      style={{
                        background: diffInfo.positive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        color: diffInfo.positive ? '#4ade80' : '#f87171',
                      }}
                    >
                      {diffInfo.positive ? '+' : ''}{formatNumber(diffInfo.diff)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <div
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: '#1e1e1e', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#242424' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: loading ? '#2a2a2a' : accentColor,
                color: loading ? '#4a4a4a' : '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon />
                  Saving…
                </span>
              ) : (
                'Save Snapshot'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  )
}
