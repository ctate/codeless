import { loadData } from '@/utils/loadData'
import { saveData } from '@/utils/saveData'
import { existsSync } from 'fs'
import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

interface Request {
  key: 'provider' | 'model'
  value: string
}

interface Settings {
  provider: string
  model: string
}

export async function POST(req: NextRequest) {
  const { key, value } = (await req.json()) as Request

  const file = './.superba/settings.json'
  const settings = await loadData<Settings>(file)

  settings[key] = value

  await saveData(file, settings)

  return NextResponse.json({})
}
