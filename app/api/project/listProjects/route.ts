import { db, deinit, init } from '@/lib/db'
import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

interface Result {
  id: number
  title: string
  createdAt: number
  image: string
  avatar: string
  username: string
}

export async function POST(req: NextRequest) {
  // const cache = await kv.hgetall<{ updatedAt: number; results: Result[] }>(
  //   'cache/listProjects'
  // )
  // if (cache && cache.updatedAt + 5 * 60 * 1000 > Date.now()) {
  //   return NextResponse.json({ code: cache.results })
  // }

  // await deinit()
  // await init()

  const users = await db
    .selectFrom('users')
    .select(['id', 'imageUrl', 'username'])
    .execute()

  const projects = await Promise.all(
    (
      await db
        .selectFrom('projects')
        .select([
          'id',
          'latestVersion',
          'name',
          'slug',
          'ownerUserId',
          'createdAt',
        ])
        .execute()
    ).map(async (project) => {
      const version = await db
        .selectFrom('projectVersions')
        .select(['imageUrl'])
        .where('projectId', '=', project.id)
        .where('number', '=', project.latestVersion)
        .executeTakeFirst()

      const u = users.find((u) => u.id === project.ownerUserId)!
      return {
        id: project.id,
        title: project.name,
        slug: project.slug,
        createdAt: project.createdAt,
        imageUrl: version?.imageUrl,
        avatar: u?.imageUrl || '',
        username: u?.username || '',
      }
    })
  )

  // await kv.hset('cache/listProjects', {
  //   updatedAt: Date.now(),
  //   results: projects,
  // })

  return NextResponse.json({ code: projects })
}
