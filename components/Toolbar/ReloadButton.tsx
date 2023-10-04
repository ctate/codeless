import { useCodelessStore } from '@/stores/codeless'
import { Refresh } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { FC, useEffect, useState } from 'react'

export const ReloadButton: FC = () => {
  const code = useCodelessStore((state) => state.code)
  const setCode = useCodelessStore((state) => state.setCode)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)

  const [isDisabled, setIsDisabled] = useState(false)

  const handleReload = () => {
    const storeCode = code.slice()
    setCode('')
    setTimeout(() => setCode(storeCode))
  }

  useEffect(() => {
    setIsDisabled(isLoading || isSaving || numberOfSteps < 1)
  }, [isLoading, isSaving, numberOfSteps])

  return (
    <Tooltip title="Reload">
      <span>
        <IconButton disabled={isDisabled} onClick={handleReload}>
          <Refresh
            sx={{
              color: isDisabled ? 'gray' : 'white',
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  )
}
