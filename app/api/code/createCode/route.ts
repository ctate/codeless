import { kv } from '@vercel/kv'
import { customAlphabet } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'

import { authOptions } from '../../auth/[...nextauth]/route'
import { paramCase } from 'change-case'

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

  await kv.hset(`users/${session.user.email}`, {
    image: session?.user?.image,
    name: session?.user?.name,
  })

  const id = `code/${paramCase(
    `${response.choices[0].message.content}-${Date.now()}`
  )}`

  await kv.hset(id, {
    currentStep: -1,
    history: [],
    latestStep: -1,
    user: session.user.email,
    versions: [],
  })

  return NextResponse.json({
    id,
  })
}
