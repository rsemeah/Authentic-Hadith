import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Authentic Hadith Assistant',
  description: 'An AI assistant for learning and understanding hadith',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50">{children}</body>
    </html>
  )
}
