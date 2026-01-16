'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatePostPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/create')
        }
    }, [status, router])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Yazı oluşturulurken bir hata oluştu')
            }

            // Success - redirect to the new post
            router.push(`/post/${data.post.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
            setIsSubmitting(false)
        }
    }

    if (status === 'loading') {
        return (
            <main className="container" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
            </main>
        )
    }

    if (!session?.user) {
        return null
    }

    return (
        <main className="container">
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--spacing-xl) 0'
            }}>
                {/* Header */}
                <div className="animate-fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <Link
                        href="/"
                        className="btn btn-secondary"
                        style={{
                            marginBottom: 'var(--spacing-md)',
                            display: 'inline-flex'
                        }}
                    >
                        ← Geri Dön
                    </Link>

                    <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>
                        Yeni Yazı Oluştur ✨
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        Düşüncelerinizi paylaşın ve hikayenizi anlatın
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="glass animate-fade-in"
                    style={{
                        padding: 'var(--spacing-xl)',
                        borderRadius: 'var(--radius-lg)'
                    }}
                >
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

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Başlık *
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Yazınız için çekici bir başlık..."
                            required
                            minLength={3}
                            maxLength={200}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={{
                        padding: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        📝 Bu yazı <strong>{session.user.nickname}</strong> ({session.user.username}) olarak yayınlanacak
                    </div>

                    <div className="form-group">
                        <label htmlFor="content" className="form-label">
                            İçerik *
                        </label>
                        <textarea
                            id="content"
                            className="form-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Hikayenizi buraya yazın..."
                            required
                            minLength={10}
                            maxLength={50000}
                            disabled={isSubmitting}
                            style={{ minHeight: '300px' }}
                        />
                        <div style={{
                            marginTop: 'var(--spacing-xs)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-dimmed)'
                        }}>
                            {content.length} karakter
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        justifyContent: 'flex-end',
                        paddingTop: 'var(--spacing-md)'
                    }}>
                        <Link
                            href="/"
                            className="btn btn-secondary"
                            style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{
                                minWidth: '150px',
                                position: 'relative'
                            }}
                        >
                            {isSubmitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                    <span className="spinner" style={{
                                        width: '16px',
                                        height: '16px',
                                        borderWidth: '2px'
                                    }}></span>
                                    Oluşturuluyor...
                                </span>
                            ) : (
                                '✨ Yazıyı Yayınla'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
