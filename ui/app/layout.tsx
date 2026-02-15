import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CFDI SQL LAB',
    description: 'Learn SQL with Mexican CFDI 4.0 data',
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                {children}
                <footer className="w-full py-2 text-center text-[10px] text-zinc-500 bg-zinc-950 border-t border-zinc-900">
                    Built by ErickDDP · CFDI SQL LAB
                </footer>
            </body>
        </html>
    )
}
