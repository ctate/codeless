import { capitalCase, paramCase } from 'change-case'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { db, deinit, init } from '@/lib/db'
import { authOptions } from '@/app/auth'

interface Request {
  prompt: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const { prompt } = (await req.json()) as Request

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const user = {
    image: session.user.image || '',
    name: session.user.name || '',
    username: session.user.email,
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: prompt,
        role: 'user',
      },
      {
        content:
          'Come up with a url-friendly string that describes the previous prompt in 2-3 words',
        role: 'system',
      },
    ],
  })

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

  const slug = `${response.choices[0].message.content}-${Date.now()}`

  const project = (await db
    .insertInto('projects')
    .returning('id')
    .values({
      latestVersion: 0,
      name: capitalCase(response.choices[0].message.content!),
      slug: paramCase(slug),
      ownerUserId: userId,
    })
    .executeTakeFirst())!

  return NextResponse.json({
    id: project.id,
    slug,
  })
}
