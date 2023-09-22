'use client'

import { Code, KeyboardReturn } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
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
import { FC, useEffect, useRef, useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export const Content: FC = () => {
  const { handleInputChange, handleSubmit, input, isLoading, messages, data } =
    useChat()

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [title, setTitle] = useState('')

  const [provider, setProvider] = useState('openai')
  const [version, setVersion] = useState('4')

  useEffect(() => {
    if (data && data[0]) {
      setTitle(data[0].title)
    }
  }, [data])

  useEffect(() => {
    const message = messages.filter((m) => m.role === 'assistant').slice(-1)[0]
    const html =
      message?.content
        ?.replace(/^```[a-zA-Z0-9]*\n/i, '')
        .replace(/\n```$/, '')
        .split(/\n/g)
        .join('\n    ') || ''
    setCode(
      `export const ${title || 'Component'}: FC = () => {\n  return (\n    ` +
        html +
        '\n  )\n}'
    )

    if (!isLoading) {
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
  }, [isLoading, messages, title])

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
              border: '1px #CCC solid',
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
                superba
              </Typography>
            </Stack>
          )}
          <form onSubmit={isLoading ? (e) => e.preventDefault() : handleSubmit}>
            <Stack alignItems="center" gap={1}>
              <TextField
                autoFocus
                onChange={handleInputChange}
                placeholder={
                  messages && messages.length > 0
                    ? 'Tell me more...'
                    : 'What do you want to build?'
                }
                value={input}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isLoading ? (
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
          <Stack alignItems="center" direction="row" gap={1}>
            <Typography>Provider</Typography>
            <Select
              onChange={(e) => setProvider(e.target.value)}
              value={provider}
              variant="standard"
            >
              <MenuItem value="openai">OpenAI</MenuItem>
            </Select>
            <Typography>Version</Typography>
            <Select
              onChange={(e) => setVersion(e.target.value)}
              value={version}
              variant="standard"
            >
              <MenuItem value="4">4</MenuItem>
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
      <Stack position="fixed" right={10} top={10} zIndex={100000000}>
        <IconButton onClick={() => setShowCode(!showCode)}>
          <Code />
        </IconButton>
      </Stack>
    </>
  )
}
