import { kv } from '@vercel/kv'
import { customAlphabet } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const username = session?.user?.email?.toLowerCase()

  if (!username) {
    return NextResponse.json({}, { status: 401 })
  }
  const id = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    7
  )()

  await kv.hset(id, {
    html: '',
    latestStep: 0,
    user: username,
  })

  return NextResponse.json({
    id,
  })
}
