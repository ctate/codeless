import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'

interface Request {
  projectId: number
  status: 'star' | 'unstar'
}

export async function POST(req: NextRequest) {
  const { projectId, status } = (await req.json()) as Request

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const user = await db
    .selectFrom('users')
    .select('id')
    .where('username', '=', session.user.email)
    .executeTakeFirst()
  if (!user) {
    return NextResponse.json({}, { status: 401 })
  }

  const project = await db
    .selectFrom('projects')
    .select(['id', 'latestVersion', 'ownerUserId'])
    .where('id', '=', projectId)
    .executeTakeFirst()
  if (!project) {
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  }

  if (status === 'star') {
    try {
      await db
        .insertInto('projectStars')
        .values({
          projectId,
          userId: user.id,
        })
        .executeTakeFirst()
    } catch (error) {}
  } else if (status === 'unstar') {
    await db
      .deleteFrom('projectStars')
      .where('projectId', '=', projectId)
      .where('userId', '=', user.id)
      .executeTakeFirst()
  }

  const starQuery = await db
    .selectFrom('projectStars')
    .select(({ fn }) => [fn.count<number>('projectId').as('count')])
    .where('projectId', '=', projectId)
    .executeTakeFirst()

  if (starQuery) {
    await db
      .updateTable('projects')
      .set({
        starCount: starQuery.count,
      })
      .where('id', '=', projectId)
      .execute()
  }

  return NextResponse.json({})
}
