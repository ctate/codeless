import { put } from '@vercel/blob'
import { chromium } from 'playwright'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '../../auth/[...nextauth]/route'
import { db } from '@/lib/db'
import axios from 'axios'

interface Request {
  projectId: number
  versionNumber: number
  dataUrl: string
}

export async function POST(req: NextRequest) {
  const { projectId, versionNumber } = (await req.json()) as Request

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({}, { status: 401 })
  }

  const project = await db
    .selectFrom('projects')
    .select('ownerUserId')
    .where('id', '=', projectId)
    .executeTakeFirst()

  if (!project) {
    return NextResponse.json({}, { status: 404 })
  }

  const version = await db
    .selectFrom('projectVersions')
    .select('codeUrl')
    .where('projectId', '=', projectId)
    .where('number', '=', versionNumber)
    .executeTakeFirst()

  if (!version) {
    return NextResponse.json({}, { status: 404 })
  }

  const user = await db
    .selectFrom('users')
    .where('username', '=', session.user.email)
    .executeTakeFirst()

  if (!user) {
    return NextResponse.json({}, { status: 403 })
  }

  const codeRes = await axios(version.codeUrl)
  const dataUrl = 'data:text/html;charset=utf-8,' + escape(codeRes.data)

  try {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(dataUrl)
    await new Promise((res) => setTimeout(res, 2000))
    const screenshot = await page.screenshot({ type: 'png' })

    const { url: imageUrl } = await put(
      `projects/${projectId}/versions/${versionNumber}/screenshot.png`,
      screenshot,
      {
        access: 'public',
      }
    )

    await db
      .updateTable('projectVersions')
      .set({
        imageUrl,
      })
      .where('projectId', '=', projectId)
      .where('number', '=', versionNumber)
      .execute()

    await browser.close()

    return NextResponse.json({
      imageUrl,
    })
  } catch (error) {
    return NextResponse.json({}, { status: 500 })
  }
}
