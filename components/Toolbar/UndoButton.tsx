import { useCodelessStore } from '@/stores/codeless'
import { Undo as UndoIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'

export const UndoButton: FC = () => {
  const id = useCodelessStore((state) => state.id)

  const setHtml = useCodelessStore((state) => state.setHtml)

  const isLoading = useCodelessStore((state) => state.isLoading)
  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const [isDisabled, setIsDiabled] = useState(false)

  const handleUndo = async () => {
    if (step === 1) {
      return
    }

    const newStep = step - 1

    setIsLoading(true)

    const res = await axios({
      method: 'POST',
      url: '/api/component/getStep',
      data: {
        id,
        step: newStep,
      },
    })

    setHtml(res.data.html)

    setStep(newStep)
    setIsLoading(false)
  }

  useEffect(() => {
    setIsDiabled(isLoading || numberOfSteps === 0 || step === 1)
  }, [isLoading, numberOfSteps, step])

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
