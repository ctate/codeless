import OpenAI from 'openai'
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from 'ai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  if (messages.length === 1) {
    messages.unshift({
      role: 'system',
      content: [
        'You will be asked to write some HTML. Follow these requirements:',
        '1. Use Tailwind',
        '2. Do not include any JavaScript or CSS',
        '3. Include accessibility',
        '4. Do not provide an explanation',
        '5. Only include code *inside* the `body` tag. Do NOT include the `head`, `body` or `html` tags.',
        '6. output with no introduction, no explaintation, only code',
        '7. For any images, use images from pexels',
        '8. Use styles and components from shacdn',
        '9. Use dark primary colors',
        '10. Do NOT include HTML comments',
        '11. Do NOT include `body` element',
        '12. Output with no introduction, no explaintation, only code.',
      ].join('\n'),
    })
    messages[1].content = `Write HTML for: ${messages[1].content}.`
  } else {
    messages[messages.length - 1].content = `${
      messages[messages.length - 1].content
    }. Output with no introduction, no explaintation, only code.`
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages,
  })

  const data = new experimental_StreamData()

  let message = ''
  const stream = OpenAIStream(response, {
    onToken(token) {
      message += token
    },
    async onFinal() {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: message,
          },
          {
            role: 'user',
            content: `Come up with a name for this component. Don't include any other text other than the name. The name should be Pascal case and work in JavaScript as a variable.`,
          },
        ],
      })

      const title = response.choices[0].message.content!

      data.append({
        title,
      })

      data.close()
    },
    experimental_streamData: true,
  })

  return new StreamingTextResponse(stream, {}, data)
}
