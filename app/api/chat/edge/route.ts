import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import { kv } from '@vercel/kv'
import OpenAI from 'openai'
import { Chat } from 'openai/resources/index'
import { NextRequest, NextResponse } from 'next/server'
import { ChatCompletionMessage } from 'openai/resources/chat/index.mjs'
import { cleanHtml } from '@/utils/cleanHtml'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const {
    id,
    messages: previousMessages,
    step = 0,
  } = (await req.json()) as {
    id: string
    messages: Chat.ChatCompletionMessage[]
    step?: number
  }

  const messages: ChatCompletionMessage[] = [
    {
      role: 'system',
      content:
        'You will be asked to write some HTML/CSS/JS in one file. Use Tailwind via https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css. If any functionality is required, use JavaScript. If any images are required, use images from Pexels. Do not provide an explanation, only code.',
    },
  ]

  const userMessages = previousMessages
    .filter((message) => message.role === 'user')
    .slice(-10)

  if (userMessages.length === 1) {
    messages.push(userMessages[0])
  } else {
    messages.push(
      ...userMessages,
      {
        role: 'system',
        content:
          'Use the HTML from the assistant\'s latest response and make changes to it to fulfill the user\'s latest prompt. Do not use the "alert" function. Do not provide an explanation, only code. Do not use any markdown. Return the full HTML.',
      }
    )
  }

  const lastAssitanceMessage = previousMessages.findLast(
    (message) => message.role === 'assistant'
  )
  if (lastAssitanceMessage) {
    messages.splice(messages.length - 2, 0, lastAssitanceMessage)
  }

  // component doesn't exist
  const code = await kv.hgetall<{
    currentStep: number
    history: number[]
    latestStep: number
    user: string
    versions: Array<{
      code: string
      messages: Array<{
        content: string
        role: string
      }>
    }>
  }>(id)
  if (!code) {
    return NextResponse.json({}, { status: 409 })
  }

  // user not authenticated
  const userRes = await fetch(`${process.env.NEXTAUTH_URL}/api/user/getUser`, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie')!,
    },
  })
  const userData = (await userRes.json()) as {
    hasStarred: boolean
    isAdmin: boolean
    user: {
      name: string
      email: string
      image: string
    }
  }
  if (!userData.user || !userData.hasStarred) {
    return NextResponse.json({}, { status: 401 })
  } else if (
    userData.user.email !== code.user &&
    userData.user.email !== process.env.ADMIN_USER
  ) {
    return NextResponse.json({}, { status: 403 })
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    stream: true,
    messages: messages.map((message) => ({
      content: message.content,
      role: message.role,
    })),
  })

  const data = new experimental_StreamData()

  let message = ''
  const stream = OpenAIStream(response, {
    onToken(token) {
      message += token
    },
    async onFinal() {
      const newHistory = code.history.slice(0, step + 1)

      const newData = {
        currentStep: newHistory.length,
        history: newHistory.concat(code.versions.length),
        latestStep: newHistory.length,
        user: userData.user.email,
        versions: code.versions.concat({
          code: cleanHtml(message),
          messages: messages
            .filter((message) => message.role === 'user')
            .map((message) => ({
              content: message.content!,
              role: message.role,
            }))
            .concat([
              {
                content: cleanHtml(message),
                role: 'assistant',
              },
            ]),
        }),
      }

      await kv.hset(id, newData)

      data.append(newData)

      await fetch(`${process.env.NEXTAUTH_URL}/api/code/screenshotCode`, {
        method: 'POST',
        headers: {
          cookie: req.headers.get('cookie')!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id,
          dataUrl: 'data:text/html;charset=utf-8,' + escape(message),
        }),
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
