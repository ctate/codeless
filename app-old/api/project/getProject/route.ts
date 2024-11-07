import { kv } from '@vercel/kv'
import axios from 'axios'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/app-old/auth'
import { db } from '@/lib/db'

interface Request {
  slug: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const userId = await (async () => {
    if (!session?.user) {
      return 0
    }

    const user = {
      image: session.user.image || '',
      name: session.user.name || '',
      username: session.user.email,
    }

    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('username', '=', user.username!)
      .executeTakeFirst()
    if (existingUser) {
      return existingUser.id
    }

    return 0
  })()

  const { slug } = (await req.json()) as Request

  const project = await db
    .selectFrom('projects')
    .select([
      'id',
      'forkedProjectId',
      'latestVersion',
      'name',
      'slug',
      'starCount',
      'ownerUserId',
    ])
    .where('slug', '=', slug)
    .executeTakeFirst()

  if (!project) {
    return NextResponse.json({}, { status: 404 })
  }

  const forkedProject = project.forkedProjectId
    ? await db
        .selectFrom('projects')
        .select(['id', 'name', 'slug'])
        .where('id', '=', project.forkedProjectId)
        .executeTakeFirst()
    : undefined

  const user = await db
    .selectFrom('users')
    .select(['id', 'imageUrl', 'username'])
    .where('id', '=', project.ownerUserId)
    .executeTakeFirst()

  if (!user) {
    return NextResponse.json({}, { status: 404 })
  }

  const history =
    (await kv.get<number[]>(`projects/${project.id}/history`)) || []

  if (!history.length && project.latestVersion > 0) {
    history.push(project.latestVersion)
    await kv.set(`projects/${project.id}/history`, history)
  }

  const versions = await Promise.all(
    (
      await db
        .selectFrom('projectVersions')
        .select(['number', 'codeUrl', 'imageUrl', 'messagesUrl', 'prompt'])
        .where('projectId', '=', project.id)
        .execute()
    ).map(async (version) => {
      const codeRes = await axios(version.codeUrl)
      const messagesRes = await axios(version.messagesUrl)
      return {
        number: version.number,
        code: codeRes.data,
        imageUrl: version.imageUrl,
        messages: messagesRes.data,
        prompt: version.prompt,
      }
    })
  )

  const isStarred = userId
    ? (
        await db
          .selectFrom('projectStars')
          .where('projectId', '=', project.id)
          .where('userId', '=', userId)
          .execute()
      ).length > 0
    : false

  return NextResponse.json({
    id: project.id,
    currentStep: history.length - 1,
    forkedProject,
    history,
    imageUrl:
      versions.find((v) => v.number === project.latestVersion)?.imageUrl || '',
    isStarred,
    latestStep: project.latestVersion,
    name: project.name,
    slug: project.slug,
    starCount: project.starCount,
    user,
    versions: versions,
  })
}
