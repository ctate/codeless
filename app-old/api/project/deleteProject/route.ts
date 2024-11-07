import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/app-old/auth'
import { db } from '@/lib/db'

interface Request {
  id: number
}

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as Request

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
    .where('id', '=', id)
    .executeTakeFirst()
  if (!project) {
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  }

  if (
    user.id !== project.ownerUserId &&
    session.user.email !== process.env.ADMIN_USER
  ) {
    return NextResponse.json({}, { status: 403 })
  }

  await db
    .deleteFrom('projects')
    .where('id', '=', project.id)
    .executeTakeFirst()

  return NextResponse.json({})
}
