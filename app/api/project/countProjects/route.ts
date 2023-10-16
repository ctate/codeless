import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const query = await db
    .selectFrom('projects')
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .executeTakeFirst()

  return NextResponse.json({ total: query?.count })
}
