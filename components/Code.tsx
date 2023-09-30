import { Code as CodeIcon } from '@mui/icons-material'
import { Drawer, IconButton, Stack } from '@mui/material'
import { FC } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { useCodelessStore } from '@/stores/codeless'

export const Code: FC = () => {
  const code = useCodelessStore((state) => state.code)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const showCode = useCodelessStore((state) => state.showCode)
  const setShowCode = useCodelessStore((state) => state.setShowCode)

  return (
    <>
      <Drawer
        anchor="bottom"
        open={showCode}
        onClose={() => setShowCode(false)}
      >
        <Stack sx={{ backgroundColor: 'rgb(40, 44, 52)', color: 'white' }}>
          {isLoading ? (
            <pre>{code}</pre>
          ) : (
            <SyntaxHighlighter language="jsx" style={docco}>
              {code}
            </SyntaxHighlighter>
          )}
        </Stack>
      </Drawer>
      {showCode && (
        <Stack position="fixed" right={10} top={10} zIndex={100000000}>
          <IconButton onClick={() => setShowCode(!showCode)}>
            <CodeIcon />
          </IconButton>
        </Stack>
      )}
    </>
  )
}
