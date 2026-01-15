import './globals.css'
import type { Metadata } from 'next'
import AuthProvider from '@/components/AuthProvider'
import Header from '@/components/Header'

export const metadata: Metadata = {
    title: 'BlogApp - Modern Blogging Platform',
    description: 'Yazılarınızı paylaşın, düşüncelerinizi dünyaya duyurun',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body>
                <AuthProvider>
                    <Header />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
