import { loadData } from '@/utils/loadData'
import { NextRequest, NextResponse } from 'next/server'

interface Request {
  key: 'provider' | 'model'
}

interface Settings {
  provider: string
  model: string
}

export async function POST(req: NextRequest) {
  const { key } = (await req.json()) as Request

  const defaultValues: Settings = {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
  }

  if (process.env.MODE === 'demo') {
    return NextResponse.json({
      value: defaultValues[key],
    })
  }

  const settings = await loadData<Settings>(`./.codeless/settings.json`)

  return NextResponse.json({
    value: settings[key] || defaultValues[key],
  })
}
