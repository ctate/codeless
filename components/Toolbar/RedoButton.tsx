import { useCodelessStore } from '@/stores/codeless'
import { Redo as RedoIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'

export const RedoButton: FC = () => {
  const id = useCodelessStore((state) => state.id)

  const history = useCodelessStore((state) => state.history)

  const setCode = useCodelessStore((state) => state.setCode)

  const isLoading = useCodelessStore((state) => state.isLoading)

  const isSaving = useCodelessStore((state) => state.isSaving)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const versions = useCodelessStore((state) => state.versions)

  const [isDisabled, setIsDiabled] = useState(false)

  const handleRedo = async () => {
    if (step >= numberOfSteps) {
      return
    }

    const newStep = step + 1

    setCode(versions[history[newStep]].code)
    setStep(newStep)
  }

  useEffect(() => {
    setIsDiabled(isLoading || isSaving || numberOfSteps === 0 || numberOfSteps - 1 <= step)
  }, [isLoading, isSaving, numberOfSteps, step])

  return (
    <Tooltip title="Redo">
      <IconButton disabled={isDisabled} onClick={handleRedo}>
        <RedoIcon
          sx={{
            color: isDisabled ? 'gray' : 'white',
          }}
        />
      </IconButton>
    </Tooltip>
  )
}
