'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SetupProfilePage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [nickname, setNickname] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)

    useEffect(() => {
        // Redirect if not logged in
        if (!session) {
            router.push('/login')
            return
        }

        // Redirect if profile already set up
        if (session.user.username && session.user.nickname) {
            router.push('/')
            return
        }

        // Pre-fill nickname with user's name
        if (session.user.name && !nickname) {
            setNickname(session.user.name)
        }
    }, [session, router, nickname])

    // Check username availability with debouncing
    useEffect(() => {
        if (!username || username.length < 4) {
            setUsernameAvailable(null)
            return
        }

        const timeoutId = setTimeout(async () => {
            setCheckingUsername(true)
            try {
                const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`)
                const data = await response.json()
                setUsernameAvailable(data.available)
            } catch (error) {
                console.error('Error checking username:', error)
            } finally {
                setCheckingUsername(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [username])

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

        if (!username || username.length < 4) {
            setError('Kullanıcı adı en az 4 karakter olmalıdır')
            return
        }

        if (!nickname || nickname.length < 2) {
            setError('Takma ad en az 2 karakter olmalıdır')
            return
        }

        if (usernameAvailable === false) {
            setError('Bu kullanıcı adı kullanılıyor')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/profile/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, nickname }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Profil ayarlanamadı')
            }

            // Update session
            await update()

            // Redirect to home
            router.push('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
            setIsSubmitting(false)
        }
    }

    if (!session) {
        return null
    }

    return (
        <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
            <div className="glass animate-fade-in" style={{
                maxWidth: '600px',
                width: '100%',
                padding: 'var(--spacing-2xl)',
                borderRadius: 'var(--radius-lg)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Profilinizi Tamamlayın ✨</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                        Devam etmeden önce kullanıcı adınızı ve takma adınızı seçin
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
                            disabled={isSubmitting}
                        />
                        <div style={{
                            marginTop: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-dimmed)'
                        }}>
                            {checkingUsername && <span>⏳ Kontrol ediliyor...</span>}
                            {!checkingUsername && usernameAvailable === true && (
                                <span style={{ color: '#10b981' }}>✓ Kullanılabilir</span>
                            )}
                            {!checkingUsername && usernameAvailable === false && (
                                <span style={{ color: '#ef4444' }}>✗ Bu kullanıcı adı kullanılıyor</span>
                            )}
                            {!username || username.length < 4 ? (
                                <span>@ ile başlamalı, sadece harf, sayı ve alt çizgi içerebilir</span>
                            ) : null}
                        </div>
                        <div style={{
                            marginTop: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-dimmed)'
                        }}>
                            örn: @ahmet, @zeynep (En az 4 karakter ve sonradan değiştirilemez. Paylaştığınız yazıların altında görünecek.)
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
                            disabled={isSubmitting}
                        />
                        <div style={{
                            marginTop: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-dimmed)'
                        }}>
                            Ana sayfada ve yazı kartlarında bu isim görünecek
                        </div>
                    </div>

                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        padding: 'var(--spacing-md)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        💡 <strong>İpucu:</strong> Kullanıcı adınız benzersiz kimliğinizdir ve profil URL'inizde görünür.
                        Takma adınız ise yazılarınızda insanların göreceği isminizdir.
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !usernameAvailable || checkingUsername}
                        style={{
                            width: '100%',
                            marginTop: 'var(--spacing-xl)'
                        }}
                    >
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}>
                                <span className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    borderWidth: '2px'
                                }}></span>
                                Kaydediliyor...
                            </span>
                        ) : (
                            '✨ Profili Kaydet ve Devam Et'
                        )}
                    </button>
                </form>
            </div>
        </main>
    )
}
