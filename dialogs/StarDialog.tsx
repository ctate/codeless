import { ExternalLink } from '@/components/ExternalLink'
import { GitHubIcon } from '@/icons/GitHubIcon'
import { useCodelessStore } from '@/stores/codeless'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { FC } from 'react'

export const StarDialog: FC = () => {
  const dialogType = useCodelessStore((state) => state.dialogType)
  const setDialogType = useCodelessStore((state) => state.setDialogType)
  return (
    <Dialog open={dialogType === 'star'} onClose={() => setDialogType('')}>
      <DialogTitle>Please star Codeless</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          To use this demo, please star this project on GitHub:
        </Typography>
        <Stack direction="row" gap={1}>
          <GitHubIcon />
          <Typography>
            <ExternalLink href="https://github.com/ctate/codeless">
              ctate/codeless
            </ExternalLink>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disableRipple
          onClick={() => setDialogType('')}
          sx={{ textTransform: 'none' }}
        >
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  )
}
