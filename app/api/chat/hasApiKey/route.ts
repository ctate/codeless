import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({
    hasApiKey: !!process.env.OPENAI_API_KEY
  })
}
