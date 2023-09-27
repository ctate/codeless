import { useCodelessStore } from '@/stores/codeless'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { signIn } from 'next-auth/react'
import { FC } from 'react'

export const UserDialog: FC = () => {
  const dialogType = useCodelessStore((state) => state.dialogType)
  const setDialogType = useCodelessStore((state) => state.setDialogType)

  return (
    <Dialog open={dialogType === 'user'} onClose={() => setDialogType('')}>
      <DialogTitle>Please sign in</DialogTitle>
      <DialogContent>
        To use this demo, please sign in with GitHub.
      </DialogContent>
      <DialogActions>
        <Button
          disableRipple
          onClick={() => signIn('github')}
          sx={{ textTransform: 'none' }}
        >
          Sign In with GitHub
        </Button>
      </DialogActions>
    </Dialog>
  )
}
