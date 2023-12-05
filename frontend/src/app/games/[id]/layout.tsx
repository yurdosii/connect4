import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Connect4 Battle'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <>
        {children}
    </>
}
