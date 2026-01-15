import Link from 'next/link'
import { getSession } from '@/lib/auth'
import UserMenu from './UserMenu'

export default async function Header() {
    const session = await getSession()
    const user = session?.user

    return (
        <header
            className="glass"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: 'var(--spacing-xl)'
            }}
        >
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-md) var(--spacing-md)',
            }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h2 className="gradient-text" style={{
                        margin: 0,
                        fontSize: '1.75rem',
                        fontFamily: 'var(--font-display)'
                    }}>
                        ✨ BlogApp
                    </h2>
                </Link>

                <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <Link href="/" style={{
                        color: 'var(--color-text-muted)',
                        fontWeight: 500,
                        transition: 'color var(--transition-fast)'
                    }}>
                        Ana Sayfa
                    </Link>

                    {user ? (
                        <>
                            {/* Show "New Post" button only if profile is set up */}
                            {user.username && user.nickname && (
                                <Link href="/create" className="btn btn-primary">
                                    + Yeni Yazı
                                </Link>
                            )}

                            <UserMenu user={{
                                name: user.name,
                                nickname: user.nickname || user.name || 'User',
                                username: user.username || '@user',
                                image: user.image
                            }} />
                        </>
                    ) : (
                        <Link href="/login" className="btn btn-primary">
                            Giriş Yap
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
