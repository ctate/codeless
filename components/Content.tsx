'use client'

import { cleanHtml } from '@/utils/cleanHtml'
import {
  Apps,
  Code,
  CodeRounded,
  KeyboardReturn,
  Redo,
  Undo,
} from '@mui/icons-material'
import {
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useChat } from 'ai/react'
import axios from 'axios'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Browse } from './Browse'
import { Message } from 'ai'

export const Content: FC = () => {
  const {
    handleSubmit,
    setInput,
    isLoading: chatIsLoading,
    messages,
    setMessages,
    data,
  } = useChat()

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [isInitialized, setIsInitialized] = useState(false)

  const [code, setCode] = useState('')
  const [component, setComponent] = useState('')
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [numberOfSteps, setNumberOfSteps] = useState(0)
  const [step, setStep] = useState(0)
  const [text, setText] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [showComponents, setShowComponents] = useState(false)
  const [title, setTitle] = useState('')

  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('')

  const handleLoadComponent = async (component: string) => {
    setShowComponents(false)

    setIsLoading(true)

    const res = await axios({
      method: 'POST',
      url: '/api/component/loadComponent',
      data: {
        component,
      },
    })
    const data = res.data as {
      steps: {
        number: number
        html: string
        messages: Message[]
      }[]
    }

    const latestStep = data.steps.sort((a, b) => b.number - a.number)[0]
    setComponent(component)
    setHtml(latestStep.html)
    setMessages(data.steps.flatMap((step) => step.messages))
    setStep(data.steps.length)
    setNumberOfSteps(data.steps.length)

    setIsLoading(false)
  }

  const handleUndo = () => {
    if (step === 1) {
      return
    }

    const newStep = step - 1

    handleStep(newStep)
  }

  const handleRedo = () => {
    if (step === numberOfSteps) {
      return
    }

    const newStep = step + 1

    handleStep(newStep)
  }

  const handleStep = async (newStep: number) => {
    setIsLoading(true)

    const res = await axios({
      method: 'POST',
      url: '/api/component/getStep',
      data: {
        component,
        step: newStep,
      },
    })

    setHtml(res.data.html)
    setMessages(res.data.messages)

    setStep(newStep)
    setIsLoading(false)
  }

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newMessages = messages.slice()
    newMessages.push({
      id: `${Math.random()}`,
      role: 'user',
      content: text,
    })

    handleSubmit(e, {
      options: {
        body: {
          component,
          messages: newMessages,
          step,
        },
      },
    })

    setText('')
  }

  useEffect(() => {
    setInput(text)
  }, [setInput, text])

  const init = async () => {
    const res = await axios({
      method: 'POST',
      url: '/api/settings/getValue',
      data: {
        key: 'model',
      },
    })

    setModel(res.data.value)

    setIsInitialized(true)
  }

  const setValue = async (key: string, value: string) => {
    await axios({
      method: 'POST',
      url: '/api/settings/setValue',
      data: {
        key,
        value,
      },
    })
  }

  useEffect(() => {
    if (data && data.length > 0) {
      const latestData = data[data.length - 1]
      setTitle(latestData.title)
      setNumberOfSteps(latestData.step)
      setStep(latestData.step)
      setComponent(latestData.component)
    }
  }, [data])

  useEffect(() => {
    if (!provider) {
      return
    }
    setValue('provider', provider)
  }, [provider])

  useEffect(() => {
    if (!model) {
      return
    }
    setValue('model', model)
  }, [model])

  useEffect(() => {
    if (!chatIsLoading) {
      return
    }

    const message = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    const html = cleanHtml(message?.content)

    setHtml(html)
  }, [chatIsLoading, messages, title])

  useEffect(() => {
    setCode(
      `export const ${title || 'Component'}: FC = () => {\n  return (\n    ` +
        html +
        '\n  )\n}'
    )

    if (!chatIsLoading) {
      if (iframeRef.current) {
        iframeRef.current.src =
          'data:text/html;charset=utf-8,' +
          escape(`<!doctype html>
        <html>
        <head>
          <base href="http://localhost:3000/" />
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body style="background-color: #FFF">
          ${html}
        </body>
        </html>`)
      }
    }
  }, [html, chatIsLoading, title])

  useEffect(() => {
    init()
  }, [])

  if (!isInitialized) {
    return (
      <Stack alignItems="center" height="100vh" justifyContent="center">
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <>
      <Stack alignItems="center" height="100vh" justifyContent="center">
        {messages && messages.length > 0 && (
          <Stack
            direction="row"
            height="100%"
            mt={5}
            sx={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px #000 solid',
            }}
          >
            <Stack height="100%" width="80vw">
              <iframe
                frameBorder={0}
                ref={iframeRef}
                style={{ height: '100%' }}
              />
            </Stack>
          </Stack>
        )}
        <Stack alignItems="center" py={5}>
          {(!messages || !messages.length) && (
            <Stack alignItems="center" direction="row" gap={1}>
              <Typography mb={2} component="h1" variant="h1">
                codeless
              </Typography>
            </Stack>
          )}
          <Stack alignItems="center" direction="row" gap={2}>
            {messages && messages.length > 0 && (
              <div>
                <IconButton
                  disabled={
                    numberOfSteps === 0 ||
                    step === 1 ||
                    isLoading ||
                    chatIsLoading
                  }
                  onClick={() => handleUndo()}
                >
                  <Undo sx={{ color: 'white' }} />
                </IconButton>
                <IconButton
                  disabled={
                    numberOfSteps === 0 ||
                    numberOfSteps === step ||
                    isLoading ||
                    chatIsLoading
                  }
                  onClick={() => handleRedo()}
                >
                  <Redo sx={{ color: 'white' }} />
                </IconButton>
              </div>
            )}

            <Stack flexGrow={1}>
              <form
                onSubmit={
                  isLoading || chatIsLoading
                    ? (e) => e.preventDefault()
                    : (e) => handleSubmitForm(e)
                }
              >
                <Stack alignItems="center" gap={1}>
                  <TextField
                    autoFocus
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      messages && messages.length > 0
                        ? 'Tell me more...'
                        : 'What do you want to build?'
                    }
                    value={text}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isLoading || chatIsLoading ? (
                            <CircularProgress
                              size={24}
                              sx={{ color: 'white', marginRight: '10px' }}
                            />
                          ) : (
                            <KeyboardReturn
                              sx={{ color: 'white', marginRight: '10px' }}
                            />
                          )}
                        </InputAdornment>
                      ),
                      style: {
                        background: '#333',
                        color: '#FFF',
                        borderRadius: '50px',
                        padding: '0 20px',
                        width: '30vw',
                      },
                    }}
                  />
                </Stack>
              </form>
            </Stack>
            {messages && messages.length > 0 && (
              <div>
                <IconButton onClick={() => setShowCode(true)}>
                  <CodeRounded sx={{ color: 'white' }} />
                </IconButton>
                <IconButton onClick={() => setShowComponents(true)}>
                  <Apps sx={{ color: 'white' }} />
                </IconButton>
              </div>
            )}
          </Stack>
          <Stack alignItems="center" direction="row" gap={1}>
            <Typography color="gray">Provider</Typography>
            <Select
              onChange={(e) => setProvider(e.target.value)}
              sx={{
                color: 'white',
                '.MuiSvgIcon-root ': {
                  fill: 'white !important',
                },
              }}
              value={provider}
              variant="standard"
            >
              <MenuItem value="openai">OpenAI</MenuItem>
            </Select>
            <Typography color="gray">Model</Typography>
            <Select
              onChange={(e) => setModel(e.target.value)}
              sx={{
                color: 'white',
                '.MuiSvgIcon-root ': {
                  fill: 'white !important',
                },
              }}
              value={model}
              variant="standard"
            >
              <MenuItem value="gpt-3.5-turbo">3.5</MenuItem>
              <MenuItem value="gpt-4">4</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Stack>
      <Drawer
        anchor="bottom"
        open={showCode}
        onClose={() => setShowCode(false)}
      >
        <Stack sx={{ backgroundColor: 'rgb(40, 44, 52)', color: 'white' }}>
          <SyntaxHighlighter language="jsx" style={docco}>
            {code}
          </SyntaxHighlighter>
        </Stack>
      </Drawer>
      <Drawer
        anchor="bottom"
        open={showComponents}
        onClose={() => setShowComponents(false)}
      >
        <Stack p={2}>
          <Container maxWidth="xl">
            <Typography component="h3" mb={4} variant="h4">
              My Components
            </Typography>
            <Browse onSelect={(component) => handleLoadComponent(component)} />
          </Container>
        </Stack>
      </Drawer>
      {showCode && (
        <Stack position="fixed" right={10} top={10} zIndex={100000000}>
          <IconButton onClick={() => setShowCode(!showCode)}>
            <Code />
          </IconButton>
        </Stack>
      )}
    </>
  )
}
