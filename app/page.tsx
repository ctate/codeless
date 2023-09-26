'use client'

import { Content } from '@/components/Content'
import { SessionProvider } from 'next-auth/react'

export default async function Home() {
  return (
    <SessionProvider>
      <Content />
    </SessionProvider>
  )
}
