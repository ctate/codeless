import { loadData } from '@/utils/loadData'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { Chat } from 'openai/resources/index.mjs'

interface Request {
  component: string
  step: number
}

interface Settings {
  id: number
  content: string
  role: string
  createdAt: string
}

export async function POST(req: NextRequest) {
  const { component, step } = (await req.json()) as Request

  const html = await readFile(
    `./.codeless/components/${component}/${step}.html`,
    'utf8'
  )

  const { messages } = await loadData<{
    messages: Chat.ChatCompletionMessage[]
  }>(`./.codeless/components/${component}/${step}.json`)

  return NextResponse.json({
    html,
    messages,
  })
}
