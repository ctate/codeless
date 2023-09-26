import { XIcon } from '@/icons/XIcon'
import { useCodelessStore } from '@/stores/codeless'
import { GitHub, Twitter } from '@mui/icons-material'
import { Button, Chip, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FC, useState } from 'react'
import { ExternalLink } from './ExternalLink'

export const Header: FC = () => {
  const { data: session } = useSession()

  const mode = useCodelessStore((state) => state.mode)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    signOut()
    setAnchorEl(null)
  }

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        position="fixed"
        justifyContent="space-between"
        left={20}
        right={20}
        top={20}
      >
        <Stack>
          {mode === 'demo' && (
            <Chip
              label="Demo Mode"
              color="default"
              variant="outlined"
              sx={{ color: 'white' }}
            />
          )}
        </Stack>
        <Stack alignItems="center" direction="row" gap={2}>
          {mode === 'demo' && (
            <>
              {session?.user ? (
                <Button
                  disableRipple
                  onClick={handleClick}
                  sx={{ color: 'white' }}
                >
                  <Stack alignItems="center" direction="row" gap={2}>
                    <img height={24} src={session.user.image!} />
                    <Typography textTransform="none">
                      {session.user?.email}
                    </Typography>
                  </Stack>
                </Button>
              ) : (
                <Button
                  onClick={() => signIn('github')}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Sign In
                </Button>
              )}
            </>
          )}

          <ExternalLink href="https://github.com/ctate/codeless">
            <GitHub />
          </ExternalLink>
          <ExternalLink href="https://x.com/CodelessAI">
            <XIcon size={18} />
          </ExternalLink>
        </Stack>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ marginTop: 1, width: 500 }}
      >
        <MenuItem onClick={handleClose}>
          <ExternalLink href={`https://github.com/${session?.user?.email}`}>
            GitHub Profile
          </ExternalLink>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
      </Menu>
    </>
  )
}
