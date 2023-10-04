'use client'

import { SessionProvider } from 'next-auth/react'
import { FC, useEffect } from 'react'

import { Content } from '@/components/Content'
import { useCodelessStore } from '@/stores/codeless'

export const Wrapper: FC<{ slug: string }> = ({ slug }) => {
  const load = useCodelessStore((state) => state.load)

  useEffect(() => {
    load(slug)
  }, [load, slug])

  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  )
}
