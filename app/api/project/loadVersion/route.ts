import { put } from '@vercel/blob'
import axios from 'axios'
import { chromium } from 'playwright'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'
import { kv } from '@vercel/kv'

interface Request {
  projectId: number
  versionNumber: number
  step: number
}

export async function POST(req: NextRequest) {
  const { projectId, versionNumber, step } = (await req.json()) as Request

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const project = await db
    .selectFrom('projects')
    .select('ownerUserId')
    .where('id', '=', projectId)
    .executeTakeFirst()

  if (!project) {
    return NextResponse.json({}, { status: 404 })
  }

  const version = await db
    .selectFrom('projectVersions')
    .select('codeUrl')
    .where('projectId', '=', projectId)
    .where('number', '=', versionNumber)
    .executeTakeFirst()

  if (!version) {
    return NextResponse.json({}, { status: 404 })
  }

  const user = await db
    .selectFrom('users')
    .where('username', '=', session.user.email)
    .executeTakeFirst()

  if (!user) {
    return NextResponse.json({}, { status: 403 })
  }

  const existingHistory =
    (await kv.get<number[]>(`projects/${projectId}/history`)) || []
  const updatedHistory = existingHistory.slice(0, step + 1).concat(versionNumber)

  await kv.set(`projects/${projectId}/history`, updatedHistory)

  return NextResponse.json({})
}
