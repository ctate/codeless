import { authOptions } from '@/app-old/auth'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface Request {
  code: string
  prompt: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const { code, prompt } = (await req.json()) as Request

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: `Change the code below based on the prompt below. Do not provide explanation, only code. For any images, use images from pexels.\n\nPrompt: ${prompt}\n\nCode:\n\n${code}`,
        role: 'user',
      },
    ],
  })

  return NextResponse.json({
    code: response.choices[0].message.content,
  })
}
