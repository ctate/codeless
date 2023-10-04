import { useCodelessStore } from '@/stores/codeless'
import { DeleteForever, Settings as SettingsIcon } from '@mui/icons-material'
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

export const DeleteButton: FC = () => {
  const id = useCodelessStore((state) => state.id)
  const existingSlug = useCodelessStore((state) => state.slug)

  const [showSettings, setShowSettings] = useState(false)

  const [slug, setSlug] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    await axios({
      method: 'POST',
      url: '/api/project/deleteProject',
      data: {
        id,
      },
    })

    setIsSubmitting(false)
    setShowSettings(false)

    window.location.href = `/`
  }

  return (
    <>
      <Tooltip title="Delete">
        <IconButton onClick={() => setShowSettings(!showSettings)}>
          <DeleteForever
            sx={{
              color: 'white',
            }}
          />
        </IconButton>
      </Tooltip>
      <Dialog onClose={() => setShowSettings(false)} open={showSettings}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure?? If so, enter the slug below and click <b>Delete</b>
              :{' '}
            </Typography>
            <Typography>{existingSlug}</Typography>
            <Stack gap={2} mt={1}>
              <TextField
                disabled={isSubmitting}
                label="Slug"
                onChange={(e) => setSlug(e.target.value)}
                value={slug}
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
            <Button
              disabled={isSubmitting || slug !== existingSlug}
              type="submit"
            >
              Delete
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
