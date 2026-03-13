import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    select: { clientName: true },
    distinct: ['clientName'],
    orderBy: { clientName: 'asc' },
  })

  const clients = videos.map((v) => v.clientName)
  return NextResponse.json(clients)
}
