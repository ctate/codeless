'use client'

import { Content } from '@/components/Content'
import { useCodelessStore } from '@/stores/codeless'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export default function CodePage({
  params,
}: {
  params: {
    id: string
  }
}) {
  const load = useCodelessStore((state) => state.load)

  useEffect(() => {
    load(params.id)
  }, [load, params])

  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  )
}
