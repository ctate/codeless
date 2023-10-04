import { useCodelessStore } from '@/stores/codeless'
import { AdsClick as AdsClickIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'

export const SnippetButton: FC = () => {
  const isLoading = useCodelessStore((state) => state.isLoading)

  const snippetIsEnabled = useCodelessStore((state) => state.snippetIsEnabled)
  const setSnippetIsEnabled = useCodelessStore(
    (state) => state.setSnippetIsEnabled
  )

  return (
    <Tooltip title="Select Element">
      <span>
        <IconButton
          disabled={isLoading}
          onClick={() => setSnippetIsEnabled(!snippetIsEnabled)}
        >
          <AdsClickIcon
            sx={{
              color: isLoading ? 'gray' : snippetIsEnabled ? 'blue' : 'white',
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  )
}
