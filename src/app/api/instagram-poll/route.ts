import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const runId = searchParams.get('runId')
  if (!runId) return NextResponse.json({ error: 'runId required' }, { status: 400 })

  const token = process.env.APIFY_TOKEN
  if (!token) return NextResponse.json({ status: 'FAILED' })

  try {
    // Check run status
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!statusRes.ok) return NextResponse.json({ status: 'FAILED' })

    const statusData = await statusRes.json()
    const runStatus: string = statusData?.data?.status ?? 'RUNNING'

    if (runStatus === 'RUNNING' || runStatus === 'READY' || runStatus === 'ABORTING') {
      return NextResponse.json({ status: 'RUNNING' })
    }

    if (runStatus !== 'SUCCEEDED') {
      return NextResponse.json({ status: 'FAILED' })
    }

    // Fetch results
    const itemsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!itemsRes.ok) return NextResponse.json({ status: 'FAILED' })

    const items = await itemsRes.json()
    const post = Array.isArray(items) ? items[0] : null
    if (!post) return NextResponse.json({ status: 'FAILED' })

    return NextResponse.json({
      status: 'SUCCEEDED',
      title: post.caption ? String(post.caption).slice(0, 120) : '',
      thumbnail_url: post.displayUrl ?? null,
      author_name: post.ownerUsername ? '@' + post.ownerUsername : null,
      stats: {
        views: post.videoViewCount ?? post.videoPlayCount ?? null,
        likes: post.likesCount ?? null,
        comments: post.commentsCount ?? null,
        shares: null,
      },
    })
  } catch (e) {
    console.error('instagram-poll error:', e)
    return NextResponse.json({ status: 'FAILED' })
  }
}
