import { useCodelessStore } from '@/stores/codeless'
import { Redo as RedoIcon } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'

export const RedoButton: FC = () => {
  const id = useCodelessStore((state) => state.id)

  const setHtml = useCodelessStore((state) => state.setHtml)

  const isLoading = useCodelessStore((state) => state.isLoading)
  const setIsLoading = useCodelessStore((state) => state.setIsLoading)

  const numberOfSteps = useCodelessStore((state) => state.numberOfSteps)

  const step = useCodelessStore((state) => state.step)
  const setStep = useCodelessStore((state) => state.setStep)

  const [isDisabled, setIsDiabled] = useState(false)

  const handleRedo = async () => {
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
    setIsDiabled(isLoading || numberOfSteps === 0 || numberOfSteps === step)
  }, [isLoading, numberOfSteps, step])

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
