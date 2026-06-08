import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChatJimny - Understand Any PDF in Seconds',
  description: 'AI-powered PDF chat tool. Upload any PDF and ask questions with cited answers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}