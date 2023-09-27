import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

interface Request {
  id: string
}

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as Request

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

  return NextResponse.json({
    id,
    currentStep: code.currentStep,
    history: code.history,
    image: code.image,
    latestStep: code.latestStep,
    user: code.user,
    versions: code.versions,
  })
}
