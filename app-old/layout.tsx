import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'codeless',
  description: 'use AI to generate UI components',
  metadataBase: new URL('https://codelessai.vercel.app'),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {props.children}
        <Analytics />
      </body>
    </html>
  )
}
