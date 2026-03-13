import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { views, likes, comments, shares } = body

    // Verify the video exists
    const video = await prisma.video.findUnique({
      where: { id: params.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const stat = await prisma.stat.create({
      data: {
        videoId: params.id,
        views: Number(views) || 0,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        shares: Number(shares) || 0,
      },
    })

    return NextResponse.json({
      ...stat,
      recordedAt: stat.recordedAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/videos/[id]/stats error:', error)
    return NextResponse.json({ error: 'Failed to add stat snapshot' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await prisma.stat.findMany({
      where: { videoId: params.id },
      orderBy: { recordedAt: 'asc' },
    })

    return NextResponse.json(
      stats.map((s) => ({
        ...s,
        recordedAt: s.recordedAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error('GET /api/videos/[id]/stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
