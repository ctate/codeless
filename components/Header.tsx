import { XIcon } from '@/icons/XIcon'
import { useCodelessStore } from '@/stores/codeless'
import {
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FC, useState } from 'react'
import GitHubButton from 'react-github-btn'
import { ExternalLink } from './ExternalLink'
import { GitHubIcon } from '@/icons/GitHubIcon'
import Link from 'next/link'

export const Header: FC = () => {
  const { data: session } = useSession()

  const id = useCodelessStore((state) => state.id)

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
        <Stack alignItems="center" direction="row" gap={1}>
          <a href="/">
            <Typography component="h1" variant="h6" textTransform="lowercase">
              Codeless
            </Typography>
          </a>
          {mode === 'demo' && (
            <Chip
              label="Beta"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ textTransform: 'lowercase' }}
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
                  sx={{ color: 'white', p: 0, border: 'none', mt: -0.5 }}
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
                  disableRipple
                  onClick={() => signIn('github')}
                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Sign In
                </Button>
              )}
            </>
          )}
          <ExternalLink href="https://x.com/CodelessAI">
            <XIcon size={18} />
          </ExternalLink>
          <ExternalLink href="https://github.com/ctate/codeless">
            <GitHubIcon size={20} />
          </ExternalLink>
          <Box>
            <GitHubButton
              href="https://github.com/ctate/codeless"
              data-color-scheme="no-preference: dark; light: dark; dark: dark;"
              data-icon="octicon-star"
              data-show-count="true"
              aria-label="Star ctate/codeless on GitHub"
            >
              Star
            </GitHubButton>
          </Box>
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
