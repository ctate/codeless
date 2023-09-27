import { useCodelessStore } from '@/stores/codeless'
import { CodeRounded as CodeRoundedIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'

export const CodeButton: FC = () => {
  const setShowCode = useCodelessStore((state) => state.setShowCode)

  return (
    <Tooltip title="Show Code">
      <IconButton onClick={() => setShowCode(true)}>
        <CodeRoundedIcon sx={{ color: 'white' }} />
      </IconButton>
    </Tooltip>
  )
}
