import { db } from '@/lib/db'
import { kv } from '@vercel/kv'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

interface Request {
  slug: string
}

export async function POST(req: NextRequest) {
  const { slug } = (await req.json()) as Request

  const project = await db
    .selectFrom('projects')
    .select(['id', 'latestVersion', 'slug', 'ownerUserId'])
    .where('slug', '=', slug)
    .executeTakeFirst()

  if (!project) {
    return NextResponse.json({}, { status: 404 })
  }

  const history = (await kv.get<number[]>(`/projects/${project.id}/history`))!

  const versions = await Promise.all(
    (
      await db
        .selectFrom('projectVersions')
        .select(['number', 'codeUrl', 'imageUrl', 'messagesUrl', 'prompt'])
        .where('projectId', '=', project.id)
        .execute()
    ).map(async (version) => {
      const codeRes = await axios(version.codeUrl)
      const messagesRes = await axios(version.messagesUrl)
      return {
        number: version.number,
        code: codeRes.data,
        imageUrl: version.imageUrl,
        messages: messagesRes.data,
        prompt: version.prompt,
      }
    })
  )

  return NextResponse.json({
    id: project.id,
    currentStep: history.length - 1,
    history,
    imageUrl:
      versions.find((v) => v.number === project.latestVersion)?.imageUrl || '',
    latestStep: project.latestVersion,
    slug: project.slug,
    user: project.ownerUserId,
    versions: versions,
  })
}
