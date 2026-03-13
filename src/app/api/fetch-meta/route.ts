import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform } from '@/lib/utils'

interface MetaResult {
  title: string
  thumbnail_url: string | null
  author_name: string | null
  platform: string
  stats: {
    views: number | null
    likes: number | null
    comments: number | null
    shares: number | null
  }
  pending?: boolean
  runId?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const platform = detectPlatform(url)

  if (!platform) {
    return NextResponse.json(
      { error: 'Unsupported platform. Use TikTok or Instagram URLs.' },
      { status: 400 }
    )
  }

  const empty: MetaResult = {
    title: '',
    thumbnail_url: null,
    author_name: null,
    platform,
    stats: { views: null, likes: null, comments: null, shares: null },
  }

  try {
    if (platform === 'tiktok') {
      return NextResponse.json(await fetchTikTokMeta(url, empty))
    }
    if (platform === 'instagram') {
      const apifyToken = process.env.APIFY_TOKEN
      if (apifyToken) {
        return NextResponse.json(await startApifyInstagramRun(url, empty, apifyToken))
      }
      return NextResponse.json(await fetchInstagramMeta(url, empty))
    }
    return NextResponse.json(empty)
  } catch (error) {
    console.error('fetch-meta error:', error)
    return NextResponse.json(empty)
  }
}

// ─── TikTok via tikwm.com (free, no key needed, 5k req/day) ──────────────────

async function fetchTikTokMeta(url: string, fallback: MetaResult): Promise<MetaResult> {
  try {
    const body = new URLSearchParams({ url, web: '1', hd: '1' })
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) return fallback
    const json = await res.json()

    if (json.code === 0 && json.data) {
      const d = json.data
      return {
        title: d.title || '',
        thumbnail_url: d.cover || d.origin_cover || null,
        author_name: d.author?.nickname || d.author?.unique_id || null,
        platform: 'tiktok',
        stats: {
          views: typeof d.play_count === 'number' ? d.play_count : null,
          likes: typeof d.digg_count === 'number' ? d.digg_count : null,
          comments: typeof d.comment_count === 'number' ? d.comment_count : null,
          shares: typeof d.share_count === 'number' ? d.share_count : null,
        },
      }
    }
  } catch (e) {
    console.error('tikwm error:', e)
  }

  // Fallback: TikTok oEmbed for at least title + thumbnail
  try {
    const oembedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (oembedRes.ok) {
      const data = await oembedRes.json()
      return {
        ...fallback,
        title: data.title || '',
        thumbnail_url: data.thumbnail_url || null,
        author_name: data.author_name || null,
      }
    }
  } catch (e) {
    console.error('tiktok oembed fallback error:', e)
  }

  return fallback
}

// ─── Instagram via Apify (free tier) ─────────────────────────────────────────

async function startApifyInstagramRun(
  url: string,
  fallback: MetaResult,
  token: string
): Promise<MetaResult> {
  // First try to get title/thumbnail quickly via og:description scrape
  const partial = await fetchInstagramMeta(url, fallback)

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: 'posts',
          resultsLimit: 1,
        }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) return partial

    const data = await res.json()
    const runId = data?.data?.id
    if (!runId) return partial

    // Return immediately with partial data + runId so client can poll
    return { ...partial, pending: true, runId }
  } catch (e) {
    console.error('Apify start error:', e)
    return partial
  }
}

// ─── Instagram via page scraping (fallback) ───────────────────────────────────

async function fetchInstagramMeta(url: string, fallback: MetaResult): Promise<MetaResult> {
  // Normalize URL (strip query params, trailing slash)
  const cleanUrl = url.split('?')[0].replace(/\/$/, '')

  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) return fallback

    const html = await res.text()

    // If redirected to login page, bail early
    if (html.includes('You must log in') || html.includes('loginForm')) {
      return fallback
    }

    const result: MetaResult = { ...fallback }

    // og:title
    const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)
    if (titleMatch) result.title = decodeHtmlEntities(titleMatch[1])

    // og:image (thumbnail)
    const imgMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)
    if (imgMatch) result.thumbnail_url = decodeHtmlEntities(imgMatch[1])

    // og:description — Instagram includes: "1,234 Likes, 56 Comments - @handle on Instagram"
    const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/)
    if (descMatch) {
      const desc = decodeHtmlEntities(descMatch[1])

      // Try "1,234 Likes, 56 Comments" pattern
      const statsMatch = desc.match(/([\d,]+)\s+Likes?,\s+([\d,]+)\s+Comments?/)
      if (statsMatch) {
        result.stats.likes = parseFormattedNumber(statsMatch[1])
        result.stats.comments = parseFormattedNumber(statsMatch[2])
      }

      // Try to extract author from "- @handle on Instagram"
      const authorMatch = desc.match(/-\s+@?([\w.]+)\s+on Instagram/)
      if (authorMatch) result.author_name = '@' + authorMatch[1]
    }

    return result
  } catch (e) {
    console.error('instagram scrape error:', e)
    return fallback
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFormattedNumber(str: string): number {
  return parseInt(str.replace(/,/g, ''), 10) || 0
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}
