import { useCodelessStore } from '@/stores/codeless'
import { Apps as AppsIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'

export const BrowseButton: FC = () => {
  const setShowComponents = useCodelessStore((state) => state.setShowComponents)

  return (
    <Tooltip title="Browse">
      <IconButton onClick={() => setShowComponents(true)}>
        <AppsIcon sx={{ color: 'white' }} />
      </IconButton>
    </Tooltip>
  )
}
