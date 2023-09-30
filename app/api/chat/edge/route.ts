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

  const messages = previousMessages.filter((message) => message.role === 'user').slice(-4)
  const lastAssitanceMessage = previousMessages.findLast(
    (message) => message.role === 'assistant'
  )
  if (lastAssitanceMessage) {
    messages.splice(messages.length - 1, 0, lastAssitanceMessage)
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

  if (messages.length === 1) {
    messages[0].content = `Write HTML for: ${messages[0].content}.`
  } else {
    messages[messages.length - 1].content = `${
      messages[messages.length - 1].content
    }. Update the HTML from the previous response to handle this request. Make it fully functional with JavaScript. Do not use the "alert" function. Do not provide an explaintation, only code. Do not use any markdown. Return the full HTML.`
  }

  const systemMessages: ChatCompletionMessage[] = [
    {
      role: 'system',
      content:
        'You will be asked to write some HTML/CSS/JS in one file. Use Tailwind via https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css. If the user prompt asks for any images, use images from pexels. Do not provide an explaintation, only code.',
    },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    stream: true,
    messages: systemMessages.concat(
      messages.map((message) => ({
        content: message.content!,
        role: message.role,
      }))
    ),
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
