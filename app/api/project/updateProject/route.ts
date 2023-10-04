import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'

interface Request {
  id: number
  code: string
  step: number
}

export async function POST(req: NextRequest) {
  const { id, code, step } = (await req.json()) as Request

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

  const { url: codeUrl } = await put(
    `projects/${project.id}/code/${nanoid()}.html`,
    code,
    {
      access: 'public',
    }
  )
  const { url: messagesUrl } = await put(
    `projects/${project.id}/messages/${nanoid()}.json`,
    JSON.stringify([], null, 2),
    {
      access: 'public',
    }
  )

  const latestVersion = project.latestVersion + 1

  await db
    .updateTable('projects')
    .set({
      latestVersion,
    })
    .where('id', '=', project.id)
    .execute()

  await db
    .insertInto('projectVersions')
    .values({
      projectId: id,
      number: latestVersion,
      prompt: '',
      codeUrl,
      imageUrl: '',
      messagesUrl,
    })
    .executeTakeFirst()

  const existingHistory =
    (await kv.get<number[]>(`projects/${project.id}/history`)) || []
  const updatedHistory = existingHistory
    .slice(0, step + 1)
    .concat(latestVersion)

  await kv.set(`projects/${project.id}/history`, updatedHistory)

  await fetch(`${process.env.NEXTAUTH_URL}/api/project/screenshotCode`, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie')!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      projectId: id,
      versionNumber: latestVersion,
    }),
  })

  return NextResponse.json({})
}
