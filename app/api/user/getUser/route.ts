import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/app/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const existingUser = await db
    .selectFrom('users')
    .select('id')
    .where('username', '=', session?.user?.email)
    .executeTakeFirst()

  return NextResponse.json({
    isAdmin: process.env.ADMIN_USER,
    user: {
      ...session?.user,
      id: existingUser?.id,
    },
  })
}
