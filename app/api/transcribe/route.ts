import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const body = Object.fromEntries(formData)

  const openai = new OpenAI({})

  const transcript = await openai.audio.transcriptions.create({
    file: body.audio as File,
    model: 'whisper-1',
    language: 'en',
  })

  return NextResponse.json({
    text: transcript.text,
  })
}
