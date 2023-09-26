import { useCodelessStore } from '@/stores/codeless'
import { GitHub, Twitter } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'
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
      gap={2}
      right={20}
      top={20}
    >
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
        href="https://twitter.com/CodelessAI"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Twitter />
      </a>
    </Stack>
  )
}
