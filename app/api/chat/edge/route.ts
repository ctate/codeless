import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import OpenAI from 'openai'
import { Chat } from 'openai/resources/index'
import { NextRequest, NextResponse } from 'next/server'
import { ChatCompletionMessage } from 'openai/resources/chat/index.mjs'
import { cleanHtml } from '@/utils/cleanHtml'
import { db } from '@/lib/db'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { kv } from '@vercel/kv'

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
    id: number
    messages: Chat.ChatCompletionMessage[]
    step?: number
  }

  const userRes = await fetch(`${process.env.NEXTAUTH_URL}/api/user/getUser`, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie')!,
    },
  })
  const userData = (await userRes.json()) as {
    isAdmin: boolean
    user: {
      id: number
      name: string
      email: string
      image: string
    }
  }
  if (!userData.user) {
    return NextResponse.json({}, { status: 401 })
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
    messages.push(...userMessages, {
      role: 'system',
      content:
        'Use the HTML from the assistant\'s latest response and make changes to it to fulfill the user\'s latest prompt. Do not use the "alert" function. Do not provide an explanation, only code. Do not use any markdown. Return the full HTML.',
    })
  }

  const lastAssitanceMessage = previousMessages.findLast(
    (message) => message.role === 'assistant'
  )
  if (lastAssitanceMessage) {
    messages.splice(messages.length - 2, 0, lastAssitanceMessage)
  }

  // project doesn't exist
  const project = await db
    .selectFrom('projects')
    .select(['id', 'latestVersion', 'ownerUserId'])
    .where('id', '=', id)
    .executeTakeFirst()
  if (!project) {
    return NextResponse.json({}, { status: 404 })
  }

  // user not authenticated
  if (
    userData.user.id !== project.ownerUserId &&
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
      const { url: codeUrl } = await put(
        `projects/${project.id}/code/${nanoid()}.html`,
        cleanHtml(message),
        {
          access: 'public',
        }
      )
      const { url: messagesUrl } = await put(
        `projects/${project.id}/messages/${nanoid()}.json`,
        JSON.stringify(
          messages
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
          null,
          2
        ),
        {
          access: 'public',
        }
      )

      const latestVersion = project.latestVersion + 1

      await db
        .updateTable('projects')
        .set({
          latestVersion,
        })
        .where('id', '=', project.id)
        .execute()

      await db
        .insertInto('projectVersions')
        .values({
          projectId: project.id,
          number: latestVersion,
          prompt: userMessages.slice(-1)[0].content!.slice(0, 255),
          codeUrl,
          imageUrl: '',
          messagesUrl,
        })
        .execute()

      const existingHistory =
        (await kv.get<number[]>(`projects/${project.id}/history`)) || []
      const updatedHistory = existingHistory.slice(0, step + 1).concat(latestVersion)

      await kv.set(`projects/${project.id}/history`, updatedHistory)

      const newData = {
        currentStep: updatedHistory.length,
        history: updatedHistory,
        latestStep: updatedHistory.length,
        user: userData.user.email,
      }

      data.append(newData)

      fetch(`${process.env.CODELESS_API_URL}/screenshot`, {
        method: 'POST',
        headers: {
          cookie: req.headers.get('cookie')!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          projectId: id,
          versionNumber: latestVersion
        }),
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
