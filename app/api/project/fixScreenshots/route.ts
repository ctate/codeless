import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '../../auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_USER) {
    return NextResponse.json({}, { status: 403 })
  }

  const projects = await db
    .selectFrom('projects')
    .select(['id', 'latestVersion'])
    .execute()

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]

    if (!project.latestVersion) {
      continue
    }

    await fetch(`${process.env.NEXTAUTH_URL}/api/project/screenshotCode`, {
      method: 'POST',
      headers: {
        cookie: req.headers.get('cookie')!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        versionNumber: project.latestVersion,
      }),
    })
  }

  return NextResponse.json({})
}
