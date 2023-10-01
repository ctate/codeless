import { kv } from '@vercel/kv'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '../../auth/[...nextauth]/route'

interface Request {
  id: string
  code: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const { id, code: codeContent } = (await req.json()) as Request

  const code = await kv.hgetall<{
    id: string
    code: string
    currentStep: number
    history: number[]
    image: string
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
    return NextResponse.json(
      {},
      {
        status: 404,
      }
    )
  }

  if (
    session?.user?.email !== code.user &&
    session?.user?.email !== process.env.ADMIN_USER
  ) {
    return NextResponse.json({}, { status: 403 })
  }

  const newData = {
    currentStep: code.history.length,
    history: code.history.concat(code.versions.length),
    latestStep: code.history.length,
    user: code.user,
    versions: code.versions.concat({
      code: codeContent,
      messages: [
        {
          content: codeContent,
          role: 'assistant',
        },
      ],
    }),
  }

  await kv.hset(id, newData)

  return NextResponse.json({})
}
