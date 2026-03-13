export type Platform = 'tiktok' | 'instagram'

export interface Stat {
  id: string
  videoId: string
  views: number
  likes: number
  comments: number
  shares: number
  recordedAt: string
}

export interface Video {
  id: string
  url: string
  platform: Platform
  title: string
  thumbnail: string | null
  clientName: string
  notes: string | null
  datePosted: string
  createdAt: string
  updatedAt: string
  stats: Stat[]
}

export interface VideoWithLatestStat extends Video {
  latestStat: Stat | null
}

export interface OverviewStats {
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
}

export interface OEmbedMeta {
  title: string
  thumbnail_url: string | null
  author_name: string | null
}
