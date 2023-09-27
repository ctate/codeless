import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import { kv } from '@vercel/kv'
import OpenAI from 'openai'
import { Chat } from 'openai/resources/index'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const { id, messages, step } = (await req.json()) as {
    id: string
    messages: Chat.ChatCompletionMessage[]
    step?: number
  }

  // user not authenticated
  const userRes = await fetch(`${process.env.NEXTAUTH_URL}/api/user/getUser`, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie')!,
    },
  })
  const userData = await userRes.json()
  if (!userData.user || !userData.hasStarred) {
    return NextResponse.json({}, { status: 401 })
  }

  // component doesn't exist
  const code = await kv.hgetall<{
    history: number[]
    latestStep: number
    versions: Array<{
      code: string
      prompt: string
    }>
  }>(id)
  if (!code) {
    return NextResponse.json({}, { status: 409 })
  }

  if (messages.length === 1) {
    messages.unshift({
      role: 'system',
      content:
        'You will be asked to write some HTML/CSS/JS in one file. Use tailwind. For any images, use images from pexels. Do not provide an explaintation, only code.',
    })
    messages[1].content = `Write HTML for: ${messages[1].content}.`
  } else {
    messages[messages.length - 1].content = `${
      messages[messages.length - 1].content
    }. Do not provide an explaintation, only code.`
  }

  // TODO: fix
  // reduce number of tokens by truncating old messages
  if (messages.length > 10) {
    messages.splice(0, messages.length - 10)
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages.map((message) => ({
      content: message.content,
      role: message.role,
      function_call: message.function_call,
    })),
  })

  const data = new experimental_StreamData()

  let message = ''
  const stream = OpenAIStream(response, {
    onToken(token) {
      message += token
    },
    async onFinal() {
      const nextStep = code.latestStep + 1

      await kv.hset(id, {
        code: message,
        currentStep: code.versions.length,
        history: code.history.concat(code.versions.length),
        latestStep: nextStep,
        prompt: messages[messages.length - 1].content,
        user: userData.email || '',
        versions: code.versions.concat({
          code: message,
          prompt: messages.slice(-1)[0].content!,
        }),
      })

      data.append({
        step: nextStep,
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
