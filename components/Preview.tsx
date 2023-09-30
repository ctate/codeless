import { useCodelessStore } from '@/stores/codeless'
import { Stack } from '@mui/material'
import { FC, useEffect, useRef } from 'react'

export const Preview: FC = () => {
  const code = useCodelessStore((state) => state.code)

  const id = useCodelessStore((state) => state.id)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!iframeRef.current || isLoading) {
      return
    }

    iframeRef.current.src = 'data:text/html;charset=utf-8,' + escape(code)
  }, [code, iframeRef, isLoading])

  if (!id) {
    return null
  }

  return (
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
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            height: '100%',
            overflow: 'hidden',
          }}
        />
      </Stack>
    </Stack>
  )
}
