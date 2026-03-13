import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const client = searchParams.get('client')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (platform) where.platform = platform
    if (client) where.clientName = client
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { clientName: { contains: search } },
      ]
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        stats: {
          orderBy: { recordedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const videosWithLatest = videos.map((v) => ({
      ...v,
      datePosted: v.datePosted.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      latestStat: v.stats[0]
        ? {
            ...v.stats[0],
            recordedAt: v.stats[0].recordedAt.toISOString(),
          }
        : null,
      stats: v.stats.map((s) => ({
        ...s,
        recordedAt: s.recordedAt.toISOString(),
      })),
    }))

    return NextResponse.json(videosWithLatest)
  } catch (error) {
    console.error('GET /api/videos error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, platform, title, thumbnail, clientName, notes, datePosted, views, likes, comments, shares } = body

    if (!url || !platform || !title || !clientName || !datePosted) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const video = await prisma.video.create({
      data: {
        url,
        platform,
        title,
        thumbnail: thumbnail || null,
        clientName,
        notes: notes || null,
        datePosted: new Date(datePosted),
        stats: {
          create: {
            views: Number(views) || 0,
            likes: Number(likes) || 0,
            comments: Number(comments) || 0,
            shares: Number(shares) || 0,
          },
        },
      },
      include: {
        stats: true,
      },
    })

    return NextResponse.json({
      ...video,
      datePosted: video.datePosted.toISOString(),
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      stats: video.stats.map((s) => ({
        ...s,
        recordedAt: s.recordedAt.toISOString(),
      })),
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/videos error:', error)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json({ error: 'A video with this URL already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
