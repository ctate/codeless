import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

interface Request {
  id: string
}

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as Request

  const code = await kv.hgetall<{
    id: string
    html: string
    latestStep: number
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
    html: code.html,
    latestStep: code.latestStep,
  })
}
