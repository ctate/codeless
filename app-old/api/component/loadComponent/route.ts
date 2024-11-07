import { listFiles } from '@/utils/listFiles'
import { loadData } from '@/utils/loadData'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { Chat } from 'openai/resources/index.mjs'

interface Request {
  component: string
}

interface Step {
  number: number
  html: string
  messages: Chat.ChatCompletionMessage[]
}

export async function POST(req: NextRequest) {
  const { component } = (await req.json()) as Request

  const files = await listFiles(`./.codeless/components/${component}`)

  const steps: Step[] = []
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'latest.json' && /\.json$/i.test(files[i])) {
      const stepNumber = Number(files[i].replace(/\.json$/i, ''))

      const { messages } = await loadData<{
        messages: Chat.ChatCompletionMessage[]
      }>(`./.codeless/components/${component}/${stepNumber}.json`)

      const existingStepIndex = steps.findIndex((s) => s.number === stepNumber)
      if (existingStepIndex === -1) {
        steps.push({
          number: stepNumber,
          html: '',
          messages,
        })
      } else {
        steps.splice(existingStepIndex, 1, {
          ...steps[existingStepIndex],
          messages,
        })
      }
    } else if (files[i] !== 'latest.html' && /\.html?$/i.test(files[i])) {
      const stepNumber = Number(files[i].replace(/\.html?$/i, ''))

      const html = await readFile(
        `./.codeless/components/${component}/${stepNumber}.html`,
        'utf8'
      )

      const existingStepIndex = steps.findIndex((s) => s.number === stepNumber)
      if (existingStepIndex === -1) {
        steps.push({
          number: stepNumber,
          html,
          messages: [],
        })
      } else {
        steps.splice(existingStepIndex, 1, {
          ...steps[existingStepIndex],
          html,
        })
      }
    }
  }

  return NextResponse.json({
    steps,
  })
}
