import { useCodelessStore } from '@/stores/codeless'
import { cleanHtml } from '@/utils/cleanHtml'
import { KeyboardReturn, Mic, MicNone } from '@mui/icons-material'
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useChat } from 'ai/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'
import { UndoButton } from './Toolbar/UndoButton'
import { RedoButton } from './Toolbar/RedoButton'
import { BrowseButton } from './Toolbar/BrowseButton'
import { CodeButton } from './Toolbar/CodeButton'
import { ProviderField } from './Toolbar/ProviderField'
import { ModelField } from './Toolbar/ModelField'

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

  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const text = useCodelessStore((state) => state.text)
  const setText = useCodelessStore((state) => state.setText)

  const {
    data,
    handleSubmit,
    isLoading: chatIsLoading,
    messages,
    setInput,
  } = useChat({
    api: mode === 'demo' ? '/api/chat/edge' : '/api/chat',
  })

  const formRef = useRef<HTMLFormElement>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')

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

    if (id) {
      const newMessages = messages.slice()
      newMessages.push({
        id: `${Math.random()}`,
        role: 'user',
        content: text,
      })

      handleSubmit(e, {
        options: {
          body: {
            id,
            messages: newMessages,
            model,
            step,
          },
        },
      })

      setText('')

      return
    }

    const codeRes = await axios({
      method: 'POST',
      url: '/api/code/createCode',
      data: {
        prompt: text,
      },
    })
    const codeData = codeRes.data as {
      id: string
    }
    setId(codeData.id)

    router.replace(codeData.id)

    const newMessages = messages.slice()
    newMessages.push({
      id: `${Math.random()}`,
      role: 'user',
      content: text,
    })

    handleSubmit(e, {
      options: {
        body: {
          id: codeData.id,
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

  useEffect(() => {
    if (!chatIsLoading) {
      setIsLoading(false)
    }
  }, [chatIsLoading, setIsLoading])

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
            <UndoButton />
            <RedoButton />
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
            <CodeButton />
            <BrowseButton />
          </div>
        )}
      </Stack>
      <Stack alignItems="center" direction="row" gap={1}>
        <ProviderField />
        <ModelField />
      </Stack>
    </Stack>
  )
}
