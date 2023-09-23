import { listFolders } from '@/utils/listFolders'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'

interface Component {
  name: string
  html: string
}

export async function POST(req: NextRequest) {
  const folders = await listFolders('./.codeless/components')

  const components: Component[] = []
  for (let i = 0; i < folders.length; i++) {
    const name = folders[i]

    const html = await readFile(
      `./.codeless/components/${name}/latest.html`,
      'utf8'
    )

    components.push({
      name,
      html,
    })
  }

  return NextResponse.json({
    components,
  })
}
