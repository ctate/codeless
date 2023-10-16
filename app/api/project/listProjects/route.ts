import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'

interface Request {
  limit: number
  page: number
  sortBy: 'stars' | 'newest' | 'oldest' | 'name'
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

  const { limit, page, sortBy } = (await req.json()) as Request

  if (limit < 1 || limit > 100) {
    return NextResponse.json({ message: 'Invalid limit' }, { status: 422 })
  }
  if (page < 1) {
    return NextResponse.json({ message: 'Invalid page' }, { status: 422 })
  }
  if (!['stars', 'newest', 'oldest', 'name'].includes(sortBy)) {
    return NextResponse.json({ message: 'Invalid sortBy' }, { status: 422 })
  }

  const orderByMap: {
    [name: string]:
      | 'starCount desc'
      | 'createdAt desc'
      | 'createdAt asc'
      | 'name asc'
  } = {
    stars: 'starCount desc',
    newest: 'createdAt desc',
    oldest: 'createdAt asc',
    name: 'name asc',
  }

  let query = db
    .selectFrom('projects')
    .leftJoin('users', 'users.id', 'ownerUserId')
    .select([
      'projects.id',
      'projects.latestVersion',
      'projects.name',
      'projects.slug',
      'projects.starCount',
      'projects.ownerUserId',
      'projects.createdAt',
      'users.imageUrl as avatar',
      'users.username',
    ])
    .offset((page - 1) * limit)
    .limit(limit)
    .orderBy(orderByMap[sortBy])
  if (sortBy === 'stars') {
    query = query.orderBy('createdAt desc')
  }

  const projects = await Promise.all(
    (
      await query.execute()
    ).map(async (project) => {
      const isStarred = userId
        ? (
            await db
              .selectFrom('projectStars')
              .where('projectId', '=', project.id)
              .where('userId', '=', userId)
              .execute()
          ).length > 0
        : false

      const version = await db
        .selectFrom('projectVersions')
        .select(['imageUrl'])
        .where('projectId', '=', project.id)
        .where('number', '=', project.latestVersion)
        .executeTakeFirst()

      return {
        id: project.id,
        title: project.name,
        slug: project.slug,
        starCount: project.starCount,
        createdAt: project.createdAt,
        imageUrl: version?.imageUrl,
        avatar: project.avatar,
        username: project.username,
        isStarred: isStarred,
      }
    })
  )

  return NextResponse.json({ code: projects })
}
