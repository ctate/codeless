import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '../../auth/[...nextauth]/route'
import axios from 'axios'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const res = await axios(
    'https://api.github.com/repos/ctate/codeless/stargazers?per_page=100'
  )
  const data = res.data as Array<{ login: string }>
  const hasStarred =
    data.findIndex((d) => d.login === session?.user?.email) > -1

  return NextResponse.json({
    hasStarred,
    user: session?.user,
  })
}
