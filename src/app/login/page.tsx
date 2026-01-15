'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loginMode, setLoginMode] = useState<'oauth' | 'credentials'>('oauth')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const callbackUrl = searchParams.get('callbackUrl') || '/'

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError('')
        try {
            await signIn('google', { callbackUrl })
        } catch (error) {
            setError('Google girişi başarısız oldu')
            setIsLoading(false)
        }
    }

    const handleCredentialsSignIn = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            })

            if (result?.error) {
                // Check if it's a rate limit or lockout issue
                if (result.error.includes('locked')) {
                    setError('Hesabınız çok fazla başarısız giriş denemesi nedeniyle 1 dakika kilitlendi')
                } else if (result.error.includes('rate')) {
                    setError('Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin')
                } else {
                    setError('Kullanıcı adı veya şifre hatalı')
                }
                setIsLoading(false)
            } else if (result?.ok) {
                // Force page reload to update session
                window.location.href = callbackUrl
            }
        } catch (error) {
            setError('Giriş başarısız oldu')
            setIsLoading(false)
        }
    }

    return (
        <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
            <div className="glass animate-fade-in" style={{
                maxWidth: '500px',
                width: '100%',
                padding: 'var(--spacing-2xl)',
                borderRadius: 'var(--radius-lg)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Hoş Geldiniz 👋</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                        Devam etmek için giriş yapın
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-xl)',
                    borderBottom: '2px solid var(--glass-border)'
                }}>
                    <button
                        onClick={() => setLoginMode('oauth')}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-md)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: loginMode === 'oauth' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: loginMode === 'oauth' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: loginMode === 'oauth' ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginBottom: '-2px'
                        }}
                    >
                        Sosyal Giriş
                    </button>
                    <button
                        onClick={() => setLoginMode('credentials')}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-md)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: loginMode === 'credentials' ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: loginMode === 'credentials' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            fontWeight: loginMode === 'credentials' ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginBottom: '-2px'
                        }}
                    >
                        Şifre ile Giriş
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)',
                        background: 'rgba(220, 38, 38, 0.1)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#fca5a5'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* OAuth Mode */}
                {loginMode === 'oauth' && (
                    <div>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'white',
                                color: '#1f2937',
                                border: '1px solid #d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-sm)',
                                fontSize: '1rem',
                                fontWeight: '500',
                                marginBottom: 'var(--spacing-md)'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isLoading ? 'Giriş yapılıyor...' : 'Google ile Giriş Yap'}
                        </button>

                        <div style={{
                            marginTop: 'var(--spacing-xl)',
                            padding: 'var(--spacing-md)',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            💡 Google ile giriş yaptıktan sonra kullanıcı adı ve takma adınızı seçmeniz istenecek.
                        </div>
                    </div>
                )}

                {/* Credentials Mode */}
                {loginMode === 'credentials' && (
                    <form onSubmit={handleCredentialsSignIn}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="@kullaniciadi"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Şifre
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                marginTop: 'var(--spacing-md)'
                            }}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}>
                                    <span className="spinner" style={{
                                        width: '16px',
                                        height: '16px',
                                        borderWidth: '2px'
                                    }}></span>
                                    Giriş yapılıyor...
                                </span>
                            ) : (
                                '🔐 Giriş Yap'
                            )}
                        </button>
                    </form>
                )}

                {/* Back Link */}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                    <Link
                        href="/"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', marginBottom: 'var(--spacing-md)' }}
                    >
                        ← Ana Sayfaya Dön
                    </Link>
                </div>

                {/* Register Link */}
                <div style={{
                    textAlign: 'center',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hesabınız yok mu?
                    </p>
                    <Link
                        href="/register"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex' }}
                    >
                        Kayıt Ol
                    </Link>
                </div>
            </div>
        </main>
    )
}
