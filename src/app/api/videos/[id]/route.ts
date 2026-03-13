import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: {
        stats: {
          orderBy: { recordedAt: 'asc' },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...video,
      datePosted: video.datePosted.toISOString(),
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      stats: video.stats.map((s) => ({
        ...s,
        recordedAt: s.recordedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('GET /api/videos/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, clientName, notes, datePosted, thumbnail } = body

    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(clientName !== undefined && { clientName }),
        ...(notes !== undefined && { notes }),
        ...(datePosted !== undefined && { datePosted: new Date(datePosted) }),
        ...(thumbnail !== undefined && { thumbnail }),
      },
      include: {
        stats: {
          orderBy: { recordedAt: 'desc' },
        },
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
    })
  } catch (error) {
    console.error('PUT /api/videos/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.video.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/videos/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
