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
    latestStep: number
    versions: Array<{
      code: string
      prompt: string
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
    code: code.code,
    currentStep: code.currentStep,
    history: code.history,
    latestStep: code.latestStep,
    versions: code.versions,
  })
}
