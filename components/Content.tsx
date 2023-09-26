'use client'

import { cleanHtml } from '@/utils/cleanHtml'
import {
  Apps,
  Code,
  CodeRounded,
  CopyAll,
  GitHub,
  KeyboardReturn,
  Mic,
  MicNone,
  Redo,
  Twitter,
  Undo,
} from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useChat } from 'ai/react'
import axios from 'axios'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Browse } from './Browse'
import { Message } from 'ai'
import { signIn, useSession } from 'next-auth/react'
import { useCodelessStore } from '@/stores/codeless'
import { Header } from './Header'
import { PageLoader } from './PageLoader'
import { ExternalLink } from './ExternalLink'

let mediaRecorder: MediaRecorder | null = null
let audioChunks: BlobPart[] = []

export const Content: FC = () => {
  const hasApiKey = useCodelessStore((state) => state.hasApiKey)
  const init = useCodelessStore((state) => state.init)
  const isInitialized = useCodelessStore((state) => state.isInitialized)
  const mode = useCodelessStore((state) => state.mode)
  const model = useCodelessStore((state) => state.model)
  const setModel = useCodelessStore((state) => state.setModel)

  const {
    handleSubmit,
    setInput,
    isLoading: chatIsLoading,
    messages,
    setMessages,
    data,
    input,
  } = useChat({
    api: mode === 'demo' ? '/api/chat/edge' : '/api/chat',
  })

  const formRef = useRef<HTMLFormElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [code, setCode] = useState('')
  const [component, setComponent] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [numberOfSteps, setNumberOfSteps] = useState(0)
  const [step, setStep] = useState(0)
  const [text, setText] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [showComponents, setShowComponents] = useState(false)
  const [title, setTitle] = useState('')

  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')

  const [provider, setProvider] = useState('openai')

  const [dialogType, setDialogType] = useState<'' | 'user' | 'star'>('')

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

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (mode === 'demo') {
      const userRes = await axios({
        method: 'POST',
        url: '/api/user/getUser',
      })
      if (!userRes.data.user) {
        setDialogType('user')
        return
      } else if (!userRes.data.hasStarred) {
        setDialogType('star')
        return
      }
    }

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
          model,
          step,
        },
      },
    })

    setText('')
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)
      setAudioURL(url)

      uploadAudio(audioBlob)
    }

    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
    }
    setIsRecording(false)
  }

  const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'myRecording.wav')

    const response = await axios.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    setText(response.data.text)
  }

  useEffect(() => {
    setInput(text)
  }, [setInput, text])

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
    setCode(html)

    if (!chatIsLoading) {
      if (iframeRef.current) {
        iframeRef.current.src = 'data:text/html;charset=utf-8,' + escape(html)
      }
    }
  }, [html, chatIsLoading, title])

  useEffect(() => {
    if (audioURL && input) {
      const mockEvent = {
        preventDefault: () => {},
        currentTarget: document.createElement('form'),
      } as React.FormEvent<HTMLFormElement>

      const newMessages = messages.slice()
      newMessages.push({
        id: `${Math.random()}`,
        role: 'user',
        content: input,
      })

      handleSubmit(mockEvent, {
        options: {
          body: {
            component,
            messages: newMessages,
            model,
            step,
          },
        },
      })

      setText('')
    }
  }, [audioURL, input])

  useEffect(() => {
    if (chatIsLoading) {
      setAudioURL('')
    }
  }, [chatIsLoading])

  useEffect(() => {
    init()
  }, [])

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!hasApiKey) {
    return (
      <>
        <Stack alignItems="center" height="100vh" justifyContent="center">
          <Typography>
            To use <b>codeless</b>, create an{' '}
            <pre
              style={{
                background: 'black',
                borderRadius: '5px',
                display: 'inline-block',
                fontFamily: 'monospace',
                padding: '2px 4px',
              }}
            >
              .env.local
            </pre>{' '}
            file with your OpenAI{' '}
            <ExternalLink href="https://platform.openai.com/account/api-keys">
              API Key
            </ExternalLink>
            :
            <pre
              style={{
                alignItems: 'center',
                background: 'black',
                borderRadius: '5px',
                display: 'flex',
                fontFamily: '"Courier New", monospace !important',
                justifyContent: 'space-between',
                marginTop: '5px',
                padding: '20px',
              }}
            >
              {'OPENAI_API_KEY=""'}
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText('OPENAI_API_KEY=""')
                  setIsCopied(true)
                }}
              >
                <CopyAll sx={{ color: 'white' }} />
              </IconButton>
            </pre>
          </Typography>
        </Stack>
        <Snackbar
          open={isCopied}
          autoHideDuration={6000}
          onClose={() => setIsCopied(false)}
          message="Copied to clipboard"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </>
    )
  }

  return (
    <>
      <Header />
      <Stack
        alignItems="center"
        height="calc(100vh - 52px)"
        marginTop={messages && messages.length > 0 ? '52px' : 0}
        justifyContent="center"
      >
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
                style={{ backgroundColor: 'black', height: '100%' }}
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
                <Tooltip
                  title={
                    mode === 'demo' ? 'Not available in Demo Mode' : 'Undo'
                  }
                >
                  <IconButton
                    disabled={
                      numberOfSteps === 0 ||
                      step === 1 ||
                      isLoading ||
                      chatIsLoading ||
                      mode === 'demo'
                    }
                    onClick={() => handleUndo()}
                  >
                    <Undo
                      sx={{
                        color:
                          numberOfSteps === 0 ||
                          step === 1 ||
                          isLoading ||
                          chatIsLoading ||
                          mode === 'demo'
                            ? 'gray'
                            : 'white',
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={
                    mode === 'demo' ? 'Not available in Demo Mode' : 'Redo'
                  }
                >
                  <IconButton
                    disabled={
                      numberOfSteps === 0 ||
                      numberOfSteps === step ||
                      isLoading ||
                      chatIsLoading ||
                      mode === 'demo'
                    }
                    onClick={() => handleRedo()}
                  >
                    <Redo
                      sx={{
                        color:
                          numberOfSteps === 0 ||
                          numberOfSteps === step ||
                          isLoading ||
                          chatIsLoading ||
                          mode === 'demo'
                            ? 'gray'
                            : 'white',
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            )}
            <Stack flexGrow={1} position="relative">
              <form
                ref={formRef}
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
                          ) : text.length > 0 ? (
                            <KeyboardReturn
                              sx={{ color: 'white', marginRight: '10px' }}
                            />
                          ) : null}
                        </InputAdornment>
                      ),
                      style: {
                        background: '#333',
                        color: '#FFF',
                        borderRadius: '50px',
                        padding: '0 20px',
                        width: '500px',
                        maxWidth: '80vw',
                      },
                    }}
                  />
                </Stack>
              </form>
              {!text.length && !isLoading && !chatIsLoading && (
                <IconButton
                  onClick={
                    isRecording ? () => stopRecording() : () => startRecording()
                  }
                  sx={{ position: 'absolute', right: 25, top: 9.5 }}
                >
                  {isRecording ? (
                    <MicNone sx={{ color: 'white' }} />
                  ) : (
                    <Mic sx={{ color: 'white' }} />
                  )}
                </IconButton>
              )}
            </Stack>
            {messages && messages.length > 0 && (
              <div>
                <Tooltip title="Show Code">
                  <IconButton onClick={() => setShowCode(true)}>
                    <CodeRounded sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={
                    mode === 'demo' ? 'Not available in Demo Mode' : 'Browse'
                  }
                >
                  <IconButton
                    disabled={mode === 'demo'}
                    onClick={() => setShowComponents(true)}
                  >
                    <Apps sx={{ color: mode === 'demo' ? 'gray' : 'white' }} />
                  </IconButton>
                </Tooltip>
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
              onChange={(e) =>
                setModel(e.target.value as 'gpt-3.5-turbo' | 'gpt-4')
              }
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
      <Dialog
        open={dialogType === 'star' || dialogType === 'user'}
        onClose={() => setDialogType('')}
      >
        {dialogType === 'star' && (
          <>
            <DialogTitle>Please star Codeless</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                To use this demo, please star this project on GitHub:
              </Typography>
              <Stack direction="row" gap={1}>
                <GitHub />
                <Typography>
                  <ExternalLink href="https://github.com/ctate/codeless">
                    ctate/codeless
                  </ExternalLink>
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                disableRipple
                onClick={() => setDialogType('')}
                sx={{ textTransform: 'none' }}
              >
                Okay
              </Button>
            </DialogActions>
          </>
        )}
        {dialogType === 'user' && (
          <>
            <DialogTitle>Please sign in</DialogTitle>
            <DialogContent>
              To use this demo, please sign in with GitHub.
            </DialogContent>
            <DialogActions>
              <Button
                disableRipple
                onClick={() => signIn('github')}
                sx={{ textTransform: 'none' }}
              >
                Sign In with GitHub
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}
