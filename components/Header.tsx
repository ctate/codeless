import { XIcon } from '@/icons/XIcon'
import { useCodelessStore } from '@/stores/codeless'
import { GitHub, Twitter } from '@mui/icons-material'
import { Button, Chip, Stack } from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { FC } from 'react'

export const Header: FC = () => {
  const { data: session } = useSession()

  const mode = useCodelessStore((state) => state.mode)

  return (
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
          <Chip label="Demo Mode" color="primary" variant="outlined" />
        )}
      </Stack>
      <Stack alignItems="center" direction="row" gap={2}>
        {mode === 'demo' && (
          <>
            {session?.user ? (
              <>
                <img height={24} src={session.user.image!} />
                {session.user?.email}
              </>
            ) : (
              <Button onClick={() => signIn('github')}>
                Sign In with GitHub
              </Button>
            )}
          </>
        )}

        <a
          href="https://github.com/ctate/codeless"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GitHub />
        </a>
        <a
          href="https://x.com/CodelessAI"
          rel="noopener noreferrer"
          target="_blank"
        >
          <XIcon size={18} />
        </a>
      </Stack>
    </Stack>
  )
}
