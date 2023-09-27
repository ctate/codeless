import { CopyAll as CopyAllIcon } from '@mui/icons-material'
import { IconButton, Snackbar, Stack, Typography } from '@mui/material'
import { FC, useState } from 'react'

import { ExternalLink } from './ExternalLink'

export const ApiKeyWarning: FC = () => {
  const [isCopied, setIsCopied] = useState(false)

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
              <CopyAllIcon sx={{ color: 'white' }} />
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
