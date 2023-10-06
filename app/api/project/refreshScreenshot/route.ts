import { put } from '@vercel/blob'
import axios from 'axios'
import puppeteer from 'puppeteer'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'

interface Request {
  projectId: number
  versionNumber: number
  dataUrl: string
}

export async function POST(req: NextRequest) {
  const { projectId, versionNumber } = (await req.json()) as Request

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
    .select(['latestVersion', 'ownerUserId'])
    .where('id', '=', projectId)
    .executeTakeFirst()
  if (!project) {
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  } else if (
    user.id !== project.ownerUserId &&
    session.user.email !== process.env.ADMIN_USER
  ) {
    return NextResponse.json({}, { status: 403 })
  }

  const version = await db
    .selectFrom('projectVersions')
    .select('imageUrl')
    .where('projectId', '=', projectId)
    .where('number', '=', versionNumber)
    .executeTakeFirst()
  if (!version) {
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  } else if (
    session.user.email !== process.env.ADMIN_USER &&
    !!version.imageUrl
  ) {
    return NextResponse.json(
      {},
      {
        status: 409,
      }
    )
  }

  await fetch(`${process.env.CODELESS_API_URL}/screenshot`, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie')!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      versionNumber,
    }),
  })

  return NextResponse.json({})
}
