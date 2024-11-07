'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

import { Content } from '@/components/Content'
import { useCodelessStore } from '@/stores/codeless'
import { Header } from '@/components/Header'
import { Stack, Typography } from '@mui/material'
import Link from 'next/link'

export default function HomePage() {
  const init = useCodelessStore((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <SessionProvider>
      <Header />
      <Stack alignItems="center" gap={2} height="calc(100vh - 52px)" justifyContent="center">
        <Typography variant="h2">
          Not Found
        </Typography>
        <Typography variant="body1">
          Go back <Link href="/">home</Link>
        </Typography>
      </Stack>
    </SessionProvider>
  )
}
