import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { db } from '@/lib/db'
import { authOptions } from '@/app-old/auth'
import { kv } from '@vercel/kv'

interface Request {
  id: number
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as Request

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const user = {
    image: session.user.image || '',
    name: session.user.name || '',
    username: session.user.email,
  }

  const userId = await (async () => {
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('username', '=', user.username)
      .executeTakeFirst()
    if (existingUser) {
      return existingUser.id
    }

    const newUser = (await db
      .insertInto('users')
      .returning('id')
      .values({
        imageUrl: user.image,
        name: user.name,
        username: user.username,
      })
      .executeTakeFirst())!

    return newUser.id
  })()

  const project = await db
    .selectFrom('projects')
    .select(['name', 'slug'])
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

  const version = await db
    .selectFrom('projectVersions')
    .select(['codeUrl', 'imageUrl', 'messagesUrl', 'prompt'])
    .where('projectId', '=', id)
    .orderBy('createdAt desc')
    .executeTakeFirst()

  if (!version) {
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  }

  const slug = `${project.slug}-${Date.now()}`

  const newProject = (await db
    .insertInto('projects')
    .returning('id')
    .values({
      latestVersion: 1,
      name: project.name,
      slug,
      forkedProjectId: id,
      ownerUserId: userId,
    })
    .executeTakeFirst())!

  await db
    .insertInto('projectVersions')
    .values({
      codeUrl: version.codeUrl,
      imageUrl: version.imageUrl,
      messagesUrl: version.messagesUrl,
      number: 1,
      projectId: newProject.id,
      prompt: version.prompt,
    })
    .execute()

  await kv.set(`projects/${newProject.id}/history`, [1])

  return NextResponse.json({
    id: newProject.id,
    slug,
  })
}
