import OpenAI from 'openai'
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { paramCase } from 'change-case'
import { Chat } from 'openai/resources/index.mjs'
import axios from 'axios'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const {
    component: existingComponent,
    messages,
    model,
    step,
  } = (await req.json()) as {
    component?: string
    messages: Chat.ChatCompletionMessage[]
    model: 'gpt-3.5-turbo' | 'gpt-4'
    step?: number
  }

  if (process.env.MODE === 'demo') {
    const userRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/user/getUser`,
      {
        method: 'POST',
        headers: {
          cookie: req.headers.get('cookie')!,
        },
      }
    )
    const data = await userRes.json()
    if (!data.user || !data.hasStarred) {
      return NextResponse.json({}, { status: 401 })
    }
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
    }. For any images, use images from pexels. Do not provide an explaintation, only code.`
  }

  // TODO: fix
  // reduce number of tokens by truncating old messages
  if (messages.length > 10) {
    messages.splice(0, messages.length - 10)
  }

  const response = await openai.chat.completions.create({
    model,
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
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          ...messages.map((message) => ({
            content: message.content,
            role: message.role,
            function_call: message.function_call,
          })),
          {
            role: 'assistant',
            content: message,
          },
          {
            role: 'user',
            content: `Come up with a name for this component. Don't include any other text other than the name. The name should be Pascal case and work in JavaScript as a variable.`,
          },
        ],
      })

      const title = response.choices[0].message.content!

      const component = existingComponent || `${paramCase(title)}-${Date.now()}`
      const fullComponentDir = `./.codeless/components/${component}`
      const nextId = step ? step + 1 : 1

      data.append({
        component,
        step: nextId,
        title,
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
