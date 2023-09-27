import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const keys = await kv.keys('code/*')

  return NextResponse.json({})
}
