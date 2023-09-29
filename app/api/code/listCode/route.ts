import { kv } from '@vercel/kv'
import { capitalCase } from 'change-case'
import { NextRequest, NextResponse } from 'next/server'

interface Result {
  id: string
  title: string
  createdAt: number
  image: string
  avatar: string
  username: string
}

export async function POST(req: NextRequest) {
  const cache = await kv.hgetall<{ updatedAt: number; results: Result[] }>(
    'cache/listCode'
  )
  if (cache && cache.updatedAt + 5 * 60 * 1000 > Date.now()) {
    return NextResponse.json({ code: cache.results })
  }

  const ids = await kv.keys('code/*')
  const users = await Promise.all(
    (
      await kv.keys('users/*')
    ).map(async (user) => {
      const avatar = await kv.hget(user, 'image')

      return {
        avatar,
        username: user.split('/').slice(-1)[0],
      }
    })
  )

  const code = (
    await Promise.all(
      ids.map(async (id) => {
        const image = await kv.hget(id, 'image')
        const user = await kv.hget(id, 'user')
        const u = users.find((u) => u.username === user)!
        return {
          id,
          title: capitalCase(id.split('-').slice(0, -1).join(' ')),
          createdAt: Number(id.split('-').slice(-1)[0]),
          image: image || '',
          avatar: u?.avatar || '',
          username: u?.username || '',
        }
      })
    )
  ).filter((c) => !!c.image && !!c.username)

  await kv.hset('cache/listCode', {
    updatedAt: Date.now(),
    results: code,
  })

  return NextResponse.json({ code })
}
