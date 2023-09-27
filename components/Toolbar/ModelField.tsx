import { useCodelessStore } from '@/stores/codeless'
import { MenuItem, Select, Typography } from '@mui/material'
import axios from 'axios'
import { FC, useEffect } from 'react'

export const ModelField: FC = () => {
  const model = useCodelessStore((state) => state.model)

  const setModel = useCodelessStore((state) => state.setModel)

  const setValue = async (key: string, value: string) => {
    await axios({
      method: 'POST',
      url: '/api/settings/setValue',
      data: {
        key,
        value,
      },
    })
  }

  useEffect(() => {
    if (!model) {
      return
    }
    setValue('model', model)
  }, [model])

  return (
    <>
      <Typography color="gray">Model</Typography>
      <Select
        onChange={(e) => setModel(e.target.value as 'gpt-3.5-turbo' | 'gpt-4')}
        sx={{
          color: 'white',
          '.MuiSvgIcon-root ': {
            fill: 'white !important',
          },
        }}
        value={model}
        variant="standard"
      >
        <MenuItem value="gpt-3.5-turbo">3.5</MenuItem>
        <MenuItem value="gpt-4">4</MenuItem>
      </Select>
    </>
  )
}
