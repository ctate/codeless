import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const ids = await kv.keys('code/*')

  const code = (
    await Promise.all(
      ids.map(async (id) => {
        const code = await kv.hgetall<{
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
        if (!code || !code.versions[code.history[code.latestStep]]) {
          console.log(id)
          return
        }
        return {
          id,
          image: code.image,
          code: code.versions[code.history[code.latestStep]].code,
        }
      })
    )
  ).filter((c) => c !== undefined)

  return NextResponse.json({ code })
}
