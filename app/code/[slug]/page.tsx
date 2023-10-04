'use client'

import { Content } from '@/components/Content'
import { useCodelessStore } from '@/stores/codeless'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export default function CodePage({
  params,
}: {
  params: {
    slug: string
  }
}) {
  const load = useCodelessStore((state) => state.load)

  useEffect(() => {
    load(params.slug)
  }, [load, params])

  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  )
}
