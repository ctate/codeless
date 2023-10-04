import { Code as CodeIcon, Save } from '@mui/icons-material'
import { Drawer, IconButton, Stack } from '@mui/material'
import { FC, useState } from 'react'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react'

import { useCodelessStore } from '@/stores/codeless'
import axios from 'axios'
import Head from 'next/head'

export const Code: FC = () => {
  const code = useCodelessStore((state) => state.code)

  const id = useCodelessStore((state) => state.id)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)

  const showCode = useCodelessStore((state) => state.showCode)
  const setShowCode = useCodelessStore((state) => state.setShowCode)

  const [manualCode, setManualCode] = useState(code)

  const handleCodeUpdate = async () => {
    await axios({
      method: 'POST',
      url: '/api/project/updateProject',
      data: {
        id,
        code: manualCode,
      },
    })
  }

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
            <Editor
              height="90vh"
              defaultLanguage="html"
              defaultValue={manualCode}
              onChange={(value) => setManualCode(value || '')}
            />
          )}
        </Stack>
      </Drawer>
      {showCode && (
        <>
          <Stack
            direction="row"
            position="fixed"
            right={10}
            top={10}
            zIndex={100000000}
          >
            <IconButton disabled={isSaving} onClick={() => handleCodeUpdate()}>
              <Save style={{ color: isSaving ? 'gray' : 'white' }} />
            </IconButton>
            <IconButton onClick={() => setShowCode(!showCode)}>
              <CodeIcon style={{ color: 'white' }} />
            </IconButton>
          </Stack>
        </>
      )}
    </>
  )
}
