import {
  ArrowRight,
  ForkRight,
  OpenInNew as OpenInNewIcon,
  Star,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FC, useState } from 'react'
import GitHubButton from 'react-github-btn'

import { GitHubIcon } from '@/icons/GitHubIcon'
import { XIcon } from '@/icons/XIcon'
import { useCodelessStore } from '@/stores/codeless'

import { ExternalLink } from './ExternalLink'
import axios from 'axios'
import Link from 'next/link'

export const Header: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width:599px)')

  const { data: session } = useSession()

  const id = useCodelessStore((state) => state.id)

  const forkedProject = useCodelessStore((state) => state.forkedProject)

  const isStarred = useCodelessStore((state) => state.isStarred)

  const load = useCodelessStore((state) => state.load)

  const mode = useCodelessStore((state) => state.mode)

  const name = useCodelessStore((state) => state.name)

  const slug = useCodelessStore((state) => state.slug)

  const starCount = useCodelessStore((state) => state.starCount)

  const user = useCodelessStore((state) => state.user)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [isForking, setIsForking] = useState(false)
  const [isStarring, setIsStarring] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleFork = async (projectId: number) => {
    setIsForking(true)

    const res = await axios({
      method: 'POST',
      url: '/api/project/forkProject',
      data: {
        id: projectId,
      },
    })

    window.location.href = `/code/${res.data.slug}`

    setIsForking(false)
  }

  const handleLogout = () => {
    signOut()
    setAnchorEl(null)
  }

  const handleStar = async () => {
    setIsStarring(true)

    try {
      await axios({
        method: 'POST',
        url: '/api/project/starProject',
        data: {
          projectId: id,
          status: isStarred ? 'unstar' : 'star',
        },
      })

      await load(slug)
    } catch {}

    setIsStarring(false)
  }

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        padding="20px 20px 0 20px"
      >
        <Stack alignItems="center" direction="row" gap={1}>
          {!onlySmallScreen && (
            <>
              <a href="/" style={{ color: 'white' }}>
                <Typography
                  component="h1"
                  variant="h6"
                  textTransform="lowercase"
                >
                  Codeless
                </Typography>
              </a>
              {mode === 'demo' && (
                <Chip
                  label="Beta"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
              {user.username.length > 0 && <ArrowRight />}
            </>
          )}
          {user.username.length > 0 && (
            <>
              <Avatar src={user.imageUrl} sx={{ width: 24, height: 24 }} />
              <Stack>
                <Typography
                  component="h1"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  variant="h6"
                >
                  {name}
                </Typography>
                {!!forkedProject && (
                  <Typography variant="body2" sx={{ color: 'gray' }}>
                    Forked from{' '}
                    <Link href={`/code/${forkedProject.slug}`}>
                      {forkedProject.name}
                    </Link>
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Stack>
        <Stack alignItems="center" direction="row" gap={2}>
          {!!slug && (
            <>
              {isForking ? (
                <Stack
                  alignItems="center"
                  height={40}
                  justifyContent="center"
                  width={40}
                >
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'white',
                    }}
                  />
                </Stack>
              ) : (
                <IconButton disableRipple onClick={() => handleFork(id)}>
                  <Typography sx={{ color: 'white' }}>Fork</Typography>
                  <ForkRight sx={{ color: 'gray' }} />
                </IconButton>
              )}
              {isStarring ? (
                <Stack
                  alignItems="center"
                  height={40}
                  justifyContent="center"
                  width={40}
                >
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                </Stack>
              ) : (
                <Stack alignItems="center" direction="row">
                  <Typography>{starCount}</Typography>
                  <IconButton onClick={handleStar}>
                    <Star sx={{ color: isStarred ? 'orange' : 'gray' }} />
                  </IconButton>
                </Stack>
              )}
            </>
          )}
          {mode === 'demo' && (
            <>
              {session?.user ? (
                <Button
                  disableRipple
                  onClick={handleClick}
                  sx={{
                    color: 'white',
                    p: 0,
                    border: 'none',
                    mt: -0.5,
                    minWidth: 0,
                  }}
                >
                  <Stack alignItems="center" direction="row" gap={1}>
                    <img height={24} src={session.user.image!} />
                    {!onlySmallScreen && (
                      <Typography textTransform="none">
                        {session.user?.email}
                      </Typography>
                    )}
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
          {!slug && (
            <>
              <ExternalLink href="https://x.com/CodelessAI">
                <XIcon size={18} />
              </ExternalLink>
              <ExternalLink href="https://github.com/ctate/codeless">
                <GitHubIcon size={20} />
              </ExternalLink>
              {!onlySmallScreen && (
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
              )}
            </>
          )}
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
        {/* <MenuItem onClick={handleLogout}>My Code</MenuItem>
        <Divider /> */}
        <MenuItem onClick={handleClose}>
          <ExternalLink href={`https://github.com/${session?.user?.email}`}>
            <Stack
              alignItems="center"
              direction="row"
              gap={1}
              justifyContent="space-between"
            >
              <Typography sx={{ color: 'black' }}>GitHub Profile</Typography>
              <OpenInNewIcon sx={{ color: 'black' }} />
            </Stack>
          </ExternalLink>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
      </Menu>
    </>
  )
}
