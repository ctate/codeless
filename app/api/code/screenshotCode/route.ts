import { put } from '@vercel/blob'
import puppeteer, { Browser } from 'puppeteer'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { kv } from '@vercel/kv'

interface Request {
  id: string
  dataUrl: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(req: NextRequest) {
  const { id, dataUrl } = (await req.json()) as Request

  const code = await kv.hgetall<{
    currentStep: number
    history: number[]
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
    return NextResponse.json({}, { status: 409 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  } else if (
    session?.user?.email !== code.user &&
    session?.user?.email !== process.env.ADMIN_USER
  ) {
    return NextResponse.json({}, { status: 403 })
  }

  let browser: Browser

  try {
    browser = await puppeteer.launch({
      headless: true
    })
    const page = await browser.newPage()
    await page.goto(dataUrl)
    await new Promise((res) => setTimeout(res, 2000));
    const screenshot = await page.screenshot({ type: 'png' })

    const { url } = await put(id, screenshot, { access: 'public' })

    await kv.hset(id, {
      image: url,
    })

    await browser.close()

    return NextResponse.json({
      url,
    })
  } catch (error) {
    return NextResponse.json({}, { status: 500 })
  }
}
