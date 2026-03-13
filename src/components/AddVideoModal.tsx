'use client'

import { useState, useEffect, useRef } from 'react'
import { detectPlatform } from '@/lib/utils'
import type { Platform, VideoWithLatestStat } from '@/types'

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (video: VideoWithLatestStat) => void
}

interface FormState {
  url: string
  platform: Platform | ''
  title: string
  thumbnail: string
  clientName: string
  notes: string
  datePosted: string
  views: string
  likes: string
  comments: string
  shares: string
}

const defaultForm: FormState = {
  url: '',
  platform: '',
  title: '',
  thumbnail: '',
  clientName: '',
  notes: '',
  datePosted: new Date().toISOString().split('T')[0],
  views: '',
  likes: '',
  comments: '',
  shares: '',
}

export default function AddVideoModal({ isOpen, onClose, onSuccess }: AddVideoModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [metaFetched, setMetaFetched] = useState(false)
  const [statsAutoFilled, setStatsAutoFilled] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const fetchTriggeredRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm)
      setFetchError('')
      setSubmitError('')
      setMetaFetched(false)
      setStatsAutoFilled(false)
      fetchTriggeredRef.current = false
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleUrlChange = (url: string) => {
    const platform = detectPlatform(url)
    setForm((prev) => ({ ...prev, url, platform: platform ?? '' }))
    setMetaFetched(false)
    setStatsAutoFilled(false)
    setFetchError('')
    fetchTriggeredRef.current = false
  }

  // Auto-trigger fetch when a valid URL is pasted
  useEffect(() => {
    if (!form.url || !form.platform || fetchTriggeredRef.current) return
    fetchTriggeredRef.current = true
    fetchMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.platform])

  const fetchMeta = async () => {
    if (!form.url) return
    const platform = detectPlatform(form.url)
    if (!platform) {
      setFetchError('Invalid URL. Please enter a TikTok or Instagram URL.')
      return
    }
    setFetchLoading(true)
    setFetchError('')
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(form.url)}`)
      const data = await res.json()
      if (!res.ok) {
        setFetchError(data.error ?? 'Failed to fetch metadata')
        return
      }

      const autoStats = data.stats ?? {}
      const hasStats = Object.values(autoStats).some((v) => v !== null && v !== undefined)

      setForm((prev) => ({
        ...prev,
        platform,
        title: data.title || prev.title,
        thumbnail: data.thumbnail_url || prev.thumbnail,
        views: autoStats.views != null ? String(autoStats.views) : prev.views,
        likes: autoStats.likes != null ? String(autoStats.likes) : prev.likes,
        comments: autoStats.comments != null ? String(autoStats.comments) : prev.comments,
        shares: autoStats.shares != null ? String(autoStats.shares) : prev.shares,
      }))
      setMetaFetched(true)
      setStatsAutoFilled(hasStats)
    } catch {
      setFetchError('Network error while fetching metadata')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.platform) {
      setSubmitError('Could not detect platform from URL')
      return
    }
    if (!form.title.trim()) {
      setSubmitError('Title is required')
      return
    }
    if (!form.clientName.trim()) {
      setSubmitError('Client name is required')
      return
    }

    setSubmitLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          platform: form.platform,
          title: form.title.trim(),
          thumbnail: form.thumbnail || null,
          clientName: form.clientName.trim(),
          notes: form.notes.trim() || null,
          datePosted: form.datePosted,
          views: parseInt(form.views) || 0,
          likes: parseInt(form.likes) || 0,
          comments: parseInt(form.comments) || 0,
          shares: parseInt(form.shares) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Failed to save video')
        return
      }
      const videoWithLatest: VideoWithLatestStat = {
        ...data,
        latestStat: data.stats?.[0] ?? null,
      }
      onSuccess(videoWithLatest)
      onClose()
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const field = (key: keyof FormState) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  if (!isOpen) return null

  const accentColor =
    form.platform === 'tiktok' ? '#ff0050' : form.platform === 'instagram' ? '#c084fc' : '#06b6d4'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col animate-slide-up"
        style={{ background: '#161616', border: '1px solid #2a2a2a', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>
              Add New Video
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>
              Paste a TikTok or Instagram URL to get started
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: '#1e1e1e', color: '#7a7a7a' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* URL + Fetch */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
              Video URL <span style={{ color: '#ff0050' }}>*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://www.tiktok.com/@user/video/..."
                required
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: '#1e1e1e',
                  border: '1px solid #2a2a2a',
                  color: '#f0f0f0',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                {...field('url')}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <button
                type="button"
                onClick={fetchMeta}
                disabled={!form.url || fetchLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                style={{
                  background: form.url && !fetchLoading ? accentColor : '#2a2a2a',
                  color: form.url && !fetchLoading ? '#000' : '#4a4a4a',
                  cursor: form.url && !fetchLoading ? 'pointer' : 'not-allowed',
                }}
              >
                {fetchLoading ? (
                  <span className="flex items-center gap-1.5">
                    <SpinnerIcon />
                    Fetching…
                  </span>
                ) : (
                  'Fetch Info'
                )}
              </button>
            </div>
            {fetchError && (
              <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>
                {fetchError}
              </p>
            )}
            {metaFetched && !fetchError && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#4ade80' }}>
                <CheckIcon />
                {statsAutoFilled
                  ? 'Stats auto-filled! Review and confirm below.'
                  : 'Info fetched — please enter stats manually.'}
              </p>
            )}
          </div>

          {/* Platform badge */}
          {form.platform && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#5a5a5a' }}>Detected platform:</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: form.platform === 'tiktok' ? 'rgba(255,0,80,0.15)' : 'rgba(192,132,252,0.15)',
                  color: form.platform === 'tiktok' ? '#ff0050' : '#c084fc',
                  border: `1px solid ${form.platform === 'tiktok' ? 'rgba(255,0,80,0.3)' : 'rgba(192,132,252,0.3)'}`,
                }}
              >
                {form.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
              Video Title <span style={{ color: '#ff0050' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter video title"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
              {...field('title')}
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
              Thumbnail URL <span style={{ color: '#5a5a5a' }}>(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
              {...field('thumbnail')}
            />
          </div>

          {/* Client + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
                Client Name <span style={{ color: '#ff0050' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Client name"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                {...field('clientName')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
                Date Posted <span style={{ color: '#ff0050' }}>*</span>
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0', colorScheme: 'dark' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                {...field('datePosted')}
              />
            </div>
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#5a5a5a' }}>
              Initial Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['views', 'Views', '👁'],
                ['likes', 'Likes', '❤️'],
                ['comments', 'Comments', '💬'],
                ['shares', 'Shares / Reposts', '🔁'],
              ] as const).map(([key, label, icon]) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
                    {icon} {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                    {...field(key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
              Notes <span style={{ color: '#5a5a5a' }}>(optional)</span>
            </label>
            <textarea
              placeholder="Any notes about this video..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {submitError && (
            <div
              className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: '#1e1e1e', color: '#a0a0a0', border: '1px solid #2a2a2a' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#242424' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1e1e1e' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: submitLoading ? '#2a2a2a' : accentColor || '#06b6d4',
                color: submitLoading ? '#4a4a4a' : '#000',
                cursor: submitLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {submitLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon />
                  Saving…
                </span>
              ) : (
                'Add Video'
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
    <svg
      className="animate-spin"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
