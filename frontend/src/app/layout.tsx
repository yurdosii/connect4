import './globals.css'

import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Connect4',
  description: 'Connect4 game',
}

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full bg-slate-200">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}
