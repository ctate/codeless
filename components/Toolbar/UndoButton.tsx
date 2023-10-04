import { useCodelessStore } from '@/stores/codeless'
import { Undo as UndoIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'

export const UndoButton: FC = () => {
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

  const handleUndo = async () => {
    if (step < 1) {
      return
    }

    const newStep = step - 1

    setCode(versions.find(v => v.number === history[newStep])?.code || '')
    setStep(newStep)
  }

  useEffect(() => {
    setIsDiabled(isLoading || isSaving || numberOfSteps === 0 || step < 1)
  }, [isLoading, isSaving, numberOfSteps, step])

  return (
    <Tooltip title="Undo">
      <IconButton disabled={isDisabled} onClick={handleUndo}>
        <UndoIcon
          sx={{
            color: isDisabled ? 'gray' : 'white',
          }}
        />
      </IconButton>
    </Tooltip>
  )
}
