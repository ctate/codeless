import { useCodelessStore } from '@/stores/codeless'
import { Settings as SettingsIcon } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { FC, FormEvent, useCallback, useEffect, useState } from 'react'

export const SettingsButton: FC = () => {
  const id = useCodelessStore((state) => state.id)
  const load = useCodelessStore((state) => state.load)
  const existingSlug = useCodelessStore((state) => state.slug)

  const [showSettings, setShowSettings] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    await axios({
      method: 'POST',
      url: '/api/project/updateSettings',
      data: {
        id,
        name,
        slug,
      },
    })

    setIsSubmitting(false)
    setShowSettings(false)

    if (slug !== existingSlug) {
      window.location.href = `/code/${slug}`
    } else {
      await load(existingSlug)
    }
  }

  const init = useCallback(async () => {
    setIsLoading(true)

    const res = await axios({
      method: 'POST',
      url: '/api/project/getProject',
      data: {
        slug: existingSlug,
      },
    })

    setName(res.data.name)
    setSlug(res.data.slug)

    setIsLoading(false)
  }, [existingSlug])

  useEffect(() => {
    if (showSettings) {
      init()
    }
  }, [init, showSettings])

  return (
    <>
      <Tooltip title="Settings">
        <IconButton
          disabled={isLoading}
          onClick={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon
            sx={{
              color: 'white',
            }}
          />
        </IconButton>
      </Tooltip>
      <Dialog
        onClose={() => setShowSettings(false)}
        open={showSettings}
        fullWidth={!isLoading}
      >
        {isLoading ? (
          <DialogContent>
            <CircularProgress sx={{ color: 'black' }} />
          </DialogContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
              <Stack gap={2} mt={1}>
                <TextField
                  disabled={isSubmitting}
                  label="Name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                <TextField
                  disabled={isSubmitting}
                  label="Slug"
                  onChange={(e) => setSlug(e.target.value)}
                  value={slug}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography>https://codelessai.vercel.app/</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                disabled={isSubmitting}
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                Save
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </>
  )
}
