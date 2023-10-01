import { useCodelessStore } from '@/stores/codeless'
import { AdsClick as AdsClickIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'

export const SnippetButton: FC = () => {
  const snippetIsEnabled = useCodelessStore((state) => state.snippetIsEnabled)
  const setSnippetIsEnabled = useCodelessStore(
    (state) => state.setSnippetIsEnabled
  )

  return (
    <Tooltip title="Select Element">
      <IconButton onClick={() => setSnippetIsEnabled(!snippetIsEnabled)}>
        <AdsClickIcon sx={{ color: snippetIsEnabled ? 'blue' : 'white' }} />
      </IconButton>
    </Tooltip>
  )
}
