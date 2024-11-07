'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

import { Content } from '@/components/Content'
import { useCodelessStore } from '@/stores/codeless'

export default function HomePage() {
  const init = useCodelessStore((state) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  )
}
