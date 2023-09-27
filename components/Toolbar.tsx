import { useCodelessStore } from '@/stores/codeless'
import { cleanHtml } from '@/utils/cleanHtml'
import {
  Apps,
  CodeRounded,
  KeyboardReturn,
  Mic,
  MicNone,
  Redo,
  Undo,
} from '@mui/icons-material'
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useChat } from 'ai/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'

let mediaRecorder: MediaRecorder | null = null
let audioChunks: BlobPart[] = []

export const Toolbar: FC = () => {
  const router = useRouter()

  const setCode = useCodelessStore((state) => state.setCode)

  const setDialogType = useCodelessStore((state) => state.setDialogType)

  const setHtml = useCodelessStore((state) => state.setHtml)

  const id = useCodelessStore((state) => state.id)
  const setId = useCodelessStore((state) => state.setId)

  const isLoading = useCodelessStore((state) => state.isLoading)
  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const mode = useCodelessStore((state) => state.mode)

  const model = useCodelessStore((state) => state.model)
  const setModel = useCodelessStore((state) => state.setModel)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)
  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const provider = useCodelessStore((state) => state.provider)
  const setProvider = useCodelessStore((state) => state.setProvider)

  const setShowCode = useCodelessStore((state) => state.setShowCode)

  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const text = useCodelessStore((state) => state.text)
  const setText = useCodelessStore((state) => state.setText)

  const {
    data,
    handleSubmit,
    input,
    isLoading: chatIsLoading,
    messages,
    setInput,
    setMessages,
  } = useChat({
    api: mode === 'demo' ? '/api/chat/edge' : '/api/chat',
  })

  const formRef = useRef<HTMLFormElement>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')

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
        id,
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

    setIsLoading(true)

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

    const codeId = await (async () => {
      if (id) {
        return id
      }

      const codeRes = await axios({
        method: 'POST',
        url: '/api/code/createCode',
      })
      const codeData = codeRes.data as {
        id: string
      }
      setId(codeData.id)

      router.push(`/code/${codeData.id}`)

      return codeData.id
    })()

    const newMessages = messages.slice()
    newMessages.push({
      id: `${Math.random()}`,
      role: 'user',
      content: text,
    })

    handleSubmit(e, {
      options: {
        body: {
          id: codeId,
          messages: newMessages,
          model,
          step,
        },
      },
    })

    setIsLoading(false)
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
    if (!chatIsLoading) {
      return
    }

    const message = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    const html = cleanHtml(message?.content)

    setCode(html)
    setHtml(html)
  }, [chatIsLoading, messages, setCode, setHtml])

  useEffect(() => {
    if (data && data.length > 0) {
      const latestData = data[data.length - 1]
      setNumberOfSteps(latestData.step)
      setStep(latestData.step)
    }
  }, [data, setNumberOfSteps, setStep])

  useEffect(() => {
    setInput(text)
  }, [setInput, text])

  //   useEffect(() => {
  //     if (audioURL && input) {
  //       const mockEvent = {
  //         preventDefault: () => {},
  //         currentTarget: document.createElement('form'),
  //       } as React.FormEvent<HTMLFormElement>

  //       const newMessages = messages.slice()
  //       newMessages.push({
  //         id: `${Math.random()}`,
  //         role: 'user',
  //         content: input,
  //       })

  //       handleSubmit(mockEvent, {
  //         options: {
  //           body: {
  //             id,
  //             messages: newMessages,
  //             model,
  //             step,
  //           },
  //         },
  //       })

  //       setText('')
  //     }
  //   }, [audioURL, handleSubmit, id, input, messages, model, step])

  //   useEffect(() => {
  //     if (chatIsLoading) {
  //       setAudioURL('')
  //     }
  //   }, [chatIsLoading])

  return (
    <Stack alignItems="center" py={5}>
      {!id && (
        <Stack alignItems="center" direction="row" gap={1}>
          <Typography
            component="h1"
            mb={2}
            textTransform="lowercase"
            variant="h1"
          >
            Codeless
          </Typography>
        </Stack>
      )}
      <Stack alignItems="center" direction="row" gap={2}>
        {!!id && (
          <div>
            <Tooltip
              title={mode === 'demo' ? 'Not available in Demo Mode' : 'Undo'}
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
              title={mode === 'demo' ? 'Not available in Demo Mode' : 'Redo'}
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
        {!!id && (
          <div>
            <Tooltip title="Show Code">
              <IconButton onClick={() => setShowCode(true)}>
                <CodeRounded sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={mode === 'demo' ? 'Not available in Demo Mode' : 'Browse'}
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
          onChange={(e) => setProvider(e.target.value as 'openai')}
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
  )
}
