import { useCodelessStore } from '@/stores/codeless'
import { cleanHtml } from '@/utils/cleanHtml'
import {
  Apps as AppsIcon,
  AutoFixHigh,
  KeyboardReturn,
} from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useChat } from 'ai/react'
import axios from 'axios'
import { FC, FormEvent, useEffect, useRef } from 'react'
import { UndoButton } from './Toolbar/UndoButton'
import { RedoButton } from './Toolbar/RedoButton'
import { BrowseButton } from './Toolbar/BrowseButton'
import { CodeButton } from './Toolbar/CodeButton'
import { ProviderField } from './Toolbar/ProviderField'
import { ModelField } from './Toolbar/ModelField'
import { MicButton } from './Toolbar/MicButton'
import { nanoid } from 'nanoid'
import { ReloadButton } from './Toolbar/ReloadButton'
import { useSession } from 'next-auth/react'
import { Tips } from './Toolbar/Tips'

export const Toolbar: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const { data: session } = useSession()

  const setCode = useCodelessStore((state) => state.setCode)

  const setDialogType = useCodelessStore((state) => state.setDialogType)

  const codeHistory = useCodelessStore((state) => state.history)
  const setHistory = useCodelessStore((state) => state.setHistory)

  const id = useCodelessStore((state) => state.id)
  const setId = useCodelessStore((state) => state.setId)

  const isLoading = useCodelessStore((state) => state.isLoading)
  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const mode = useCodelessStore((state) => state.mode)

  const model = useCodelessStore((state) => state.model)

  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const text = useCodelessStore((state) => state.text)
  const setText = useCodelessStore((state) => state.setText)

  const versions = useCodelessStore((state) => state.versions)
  const setVersions = useCodelessStore((state) => state.setVersions)

  const {
    data,
    handleSubmit,
    input,
    isLoading: chatIsLoading,
    messages,
    setMessages,
    setInput,
  } = useChat({
    api: mode === 'demo' ? '/api/chat/edge' : '/api/chat',
  })

  const formRef = useRef<HTMLFormElement>(null)

  const handleFix = async () => {
    await fetch(`/api/code/fixScreenshots`, {
      method: 'POST',
    })
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

    history.pushState({}, '', codeData.id)

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

  useEffect(() => {
    if (!chatIsLoading) {
      return
    }

    const message = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    const html = cleanHtml(message?.content)

    if (html) {
      setCode(html)
    }
  }, [chatIsLoading, messages, setCode])

  useEffect(() => {
    if (data && data.length > 0) {
      const latestData = data[data.length - 1]
      setHistory(latestData.history)
      setNumberOfSteps(latestData.history.length)
      setStep(latestData.currentStep)
      setVersions(latestData.versions)
    }
  }, [data, setHistory, setMessages, setNumberOfSteps, setStep, setVersions])

  useEffect(() => {
    setInput(text)
  }, [setInput, text])

  useEffect(() => {
    if (!chatIsLoading) {
      setIsLoading(false)
    }
  }, [chatIsLoading, setIsLoading])

  useEffect(() => {
    if (!versions[codeHistory[step]]) {
      return
    }

    setMessages(
      versions[codeHistory[step]].messages.map((message) => ({
        ...message,
        id: nanoid(),
      }))
    )
  }, [codeHistory, setMessages, step, versions])

  return (
    <Stack
      alignItems="center"
      height={onlySmallScreen ? '80vh' : undefined}
      justifyContent={onlySmallScreen ? 'center' : undefined}
      py={5}
    >
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
            <ReloadButton />
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
                autoComplete="off"
                autoCorrect="off"
                autoFocus
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  id ? 'Tell me more...' : 'What do you want to build?'
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
          <MicButton />
        </Stack>
        {!!id && (
          <div>
            <CodeButton />
            <BrowseButton />
          </div>
        )}
        {!id && (
          <Stack bottom={20} direction="row" right={20} position="fixed">
            {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_USER && (
              <Button sx={{ color: 'white' }} onClick={handleFix}>
                <Stack alignItems="center" direction="row" gap={1}>
                  Run Fix
                  <AutoFixHigh />
                </Stack>
              </Button>
            )}
          </Stack>
        )}
      </Stack>
      <Stack alignItems="center" direction="row" gap={1}>
        <ProviderField />
        <ModelField />
        <Tips />
      </Stack>
    </Stack>
  )
}
