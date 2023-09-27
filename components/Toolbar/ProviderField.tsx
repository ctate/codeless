import { useCodelessStore } from '@/stores/codeless'
import { MenuItem, Select, Typography } from '@mui/material'
import axios from 'axios'
import { FC, useEffect } from 'react'

export const ProviderField: FC = () => {
  const provider = useCodelessStore((state) => state.provider)

  const setProvider = useCodelessStore((state) => state.setProvider)

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
    if (!provider) {
      return
    }
    setValue('provider', provider)
  }, [provider])

  return (
    <>
      <Typography color="gray">Provider</Typography>
      <Select
        onChange={(e) => setProvider(e.target.value as 'openai')}
        sx={{
          color: 'white',
          '.MuiSvgIcon-root ': {
            fill: 'white !important',
          },
        }}
        value={provider}
        variant="standard"
      >
        <MenuItem value="openai">OpenAI</MenuItem>
      </Select>
    </>
  )
}
