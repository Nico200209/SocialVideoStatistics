import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const video = await prisma.video.findFirst({ where: { id: params.id, userId: session.user.id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    const body = await request.json()
    const { views, likes, comments, shares } = body

    const stat = await prisma.stat.create({
      data: {
        videoId: params.id,
        views: Number(views) || 0,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        shares: Number(shares) || 0,
      },
    })

    return NextResponse.json({ ...stat, recordedAt: stat.recordedAt.toISOString() }, { status: 201 })
  } catch (error) {
    console.error('POST /api/videos/[id]/stats error:', error)
    return NextResponse.json({ error: 'Failed to add stat snapshot' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const video = await prisma.video.findFirst({ where: { id: params.id, userId: session.user.id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    const stats = await prisma.stat.findMany({ where: { videoId: params.id }, orderBy: { recordedAt: 'asc' } })
    return NextResponse.json(stats.map((s) => ({ ...s, recordedAt: s.recordedAt.toISOString() })))
  } catch (error) {
    console.error('GET /api/videos/[id]/stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
