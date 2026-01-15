'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleUsernameChange = (value: string) => {
        // Ensure @ prefix
        if (!value.startsWith('@')) {
            value = '@' + value.replace(/^@*/, '')
        }
        // Remove special characters except letters, numbers, and underscores
        value = value.replace(/[^@a-zA-Z0-9_]/g, '')
        setUsername(value.toLowerCase())
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor')
            return
        }

        if (password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır')
            return
        }

        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
            return
        }

        if (username.length < 4) {
            setError('Kullanıcı adı en az 4 karakter olmalıdır')
            return
        }

        if (nickname.length < 2) {
            setError('Takma ad en az 2 karakter olmalıdır')
            return
        }

        setIsLoading(true)

        try {
            // Register user
            const registerResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    nickname
                }),
            })

            const registerData = await registerResponse.json()

            if (!registerResponse.ok) {
                throw new Error(registerData.error || 'Kayıt başarısız oldu')
            }

            // Auto login after registration
            const signInResult = await signIn('credentials', {
                username,
                password,
                redirect: false,
            })

            if (signInResult?.error) {
                setError('Hesap oluşturuldu ama giriş yapılamadı. Lütfen giriş sayfasından deneyin.')
                setTimeout(() => router.push('/login'), 2000)
            } else {
                // Success - redirect to home
                window.location.href = '/'
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
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
                    <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Hesap Oluştur 🚀</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                        Yeni bir hesap oluşturun ve yazmaya başlayın
                    </p>
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Kullanıcı Adı *
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="@kullaniciadi"
                            required
                            disabled={isLoading}
                        />
                        <div style={{
                            marginTop: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-dimmed)'
                        }}>
                            @ ile başlamalı, sadece harf, sayı ve alt çizgi içerebilir
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nickname" className="form-label">
                            Takma Ad (Görünen İsim) *
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            className="form-input"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Adınız Soyadınız"
                            required
                            minLength={2}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Şifre *
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 8 karakter (büyük/küçük harf + rakam)"
                            required
                            minLength={8}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Şifre Tekrar *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                            minLength={8}
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
                                Hesap oluşturuluyor...
                            </span>
                        ) : (
                            '🚀 Hesap Oluştur'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--spacing-xl)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Zaten hesabınız var mı?
                    </p>
                    <Link
                        href="/login"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex' }}
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        </main>
    )
}
