import { useCodelessStore } from '@/stores/codeless'
import { cleanHtml } from '@/utils/cleanHtml'
import {
  AdsClick,
  Apps as AppsIcon,
  AutoFixHigh,
  Coffee,
  KeyboardReturn,
} from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
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
import { ExternalLink } from './ExternalLink'
import { SnippetButton } from './Toolbar/SnippetButton'
import { HistoryButton } from './Toolbar/HistoryButton'
import { SettingsButton } from './Toolbar/SettingsButton'
import { DeleteButton } from './Toolbar/DeleteButton'

export const Toolbar: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const { data: session } = useSession()

  const setCode = useCodelessStore((state) => state.setCode)

  const setDialogType = useCodelessStore((state) => state.setDialogType)

  const codeHistory = useCodelessStore((state) => state.history)
  const setHistory = useCodelessStore((state) => state.setHistory)

  const id = useCodelessStore((state) => state.id)
  const setId = useCodelessStore((state) => state.setId)

  const load = useCodelessStore((state) => state.load)

  const isLoading = useCodelessStore((state) => state.isLoading)
  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)
  const setIsSaving = useCodelessStore((state) => state.setIsSaving)

  const mode = useCodelessStore((state) => state.mode)

  const model = useCodelessStore((state) => state.model)

  const setNumberOfSteps = useCodelessStore((state) => state.setNumberOfSteps)

  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  const snippet = useCodelessStore((state) => state.snippet)

  const snippetIsEnabled = useCodelessStore((state) => state.snippetIsEnabled)
  const setSnippetIsEnabled = useCodelessStore(
    (state) => state.setSnippetIsEnabled
  )

  const setSnippetOutput = useCodelessStore((state) => state.setSnippetOutput)

  const slug = useCodelessStore((state) => state.slug)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const text = useCodelessStore((state) => state.text)
  const setText = useCodelessStore((state) => state.setText)

  const user = useCodelessStore((state) => state.user)

  const versions = useCodelessStore((state) => state.versions)

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
    await fetch(`/api/admin/migrate`, {
      method: 'POST',
    })
  }

  const handleSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (snippetIsEnabled) {
      setIsSaving(true)
      setSnippetIsEnabled(false)
      setText('')

      try {
        const res = await axios({
          method: 'POST',
          url: '/api/project/changeSnippet',
          data: {
            code: snippet,
            prompt: text,
          },
        })

        setSnippetOutput(res.data.code)
      } catch {
      } finally {
        setIsLoading(false)
      }

      return
    }

    setIsLoading(true)

    if (mode === 'demo') {
      const userRes = await axios({
        method: 'POST',
        url: '/api/user/getUser',
      })
      if (!userRes.data.user) {
        setDialogType('user')
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
      url: '/api/project/createProject',
      data: {
        prompt: text,
      },
    })
    const codeData = codeRes.data as {
      id: number
      slug: string
    }
    setId(codeData.id)

    history.pushState({}, '', `code/${codeData.slug}`)

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
    }
  }, [data, setHistory, setMessages, setNumberOfSteps, setStep])

  useEffect(() => {
    setInput(text)
  }, [setInput, text])

  useEffect(() => {
    if (!chatIsLoading) {
      setIsLoading(false)
      if (slug) {
        load(slug)
      }
    }
  }, [chatIsLoading, load, setIsLoading, slug])

  useEffect(() => {
    const version = versions.find((v) => v.number === codeHistory[step])
    if (!version) {
      return
    }

    setMessages(
      version.messages.map((message) => ({
        ...message,
        id: nanoid(),
      }))
    )
  }, [codeHistory, setMessages, step, versions])

  return (
    <Stack
      alignItems="center"
      height={!id && onlySmallScreen ? '80vh' : undefined}
      justifyContent={onlySmallScreen ? 'center' : undefined}
      pb={!id ? 20 : 0}
    >
      {!id && (
        <Stack alignItems="center" gap={1}>
          <Typography component="h1" textTransform="lowercase" variant="h1">
            Codeless
          </Typography>
          <Typography
            mb={2}
            textAlign="center"
            textTransform="lowercase"
            style={{ color: '#999' }}
            variant="h6"
          >
            The free, open-source code generator powered by AI
          </Typography>
        </Stack>
      )}
      <Stack alignItems="center" direction="row" gap={2}>
        {!!id && !onlySmallScreen && (
          <div>
            <UndoButton />
            <RedoButton />
            <HistoryButton />
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
                disabled={
                  (snippetIsEnabled && !snippet) ||
                  (user.username.length > 0 &&
                    user.username !== session?.user?.email)
                }
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  id ? 'Tell me more...' : 'What do you want to build?'
                }
                required
                value={
                  snippetIsEnabled && !snippet ? 'Select an element' : text
                }
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isLoading || isSaving || chatIsLoading ? (
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
                    background: snippetIsEnabled && !snippet ? '#000' : '#333',
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
        {!!id && !onlySmallScreen && (
          <div>
            <SnippetButton />
            <CodeButton />
            <SettingsButton />
            {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_USER && (
              <DeleteButton />
            )}
            <BrowseButton />
          </div>
        )}
      </Stack>
      <Stack alignItems="center" direction="row" gap={2} mt={2}>
        {/* <ProviderField />
        <ModelField /> */}
        <Tips />
        <ExternalLink href="https://www.buymeacoffee.com/ctate">
          <Stack
            alignItems="center"
            direction="row"
            gap={1}
            style={{ color: 'white' }}
          >
            <Coffee />
            <Typography variant="body2">Buy Me a Coffee</Typography>
          </Stack>
        </ExternalLink>
        {session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_USER && (
          <Button sx={{ color: 'white' }} onClick={handleFix}>
            <Stack alignItems="center" direction="row" gap={1}>
              <AutoFixHigh />
              <Typography textTransform="none" variant="body2">
                Run Fix
              </Typography>
            </Stack>
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
