'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface Post {
    id: string
    title: string
    content: string
    author: string
    userId?: string
    username?: string
    nickname?: string
    date: string
}

interface PostPageProps {
    params: Promise<{
        id: string
    }>
}

export default function PostPage({ params }: PostPageProps) {
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { id } = await params
                const response = await fetch(`/api/posts/${id}`)
                const data = await response.json()

                if (!response.ok || !data.success) {
                    setError(true)
                    return
                }

                setPost(data.post)
            } catch (err) {
                console.error('Error fetching post:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [params])

    if (loading) {
        return (
            <main className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh'
                }}>
                    <div className="spinner"></div>
                </div>
            </main>
        )
    }

    if (error || !post) {
        notFound()
    }

    const formattedDate = new Date(post.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    // Sanitize content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: []
    })

    return (
        <main className="container">
            <article style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'var(--spacing-xl) 0'
            }}>
                {/* Back Button */}
                <Link
                    href="/"
                    className="btn btn-secondary animate-slide-in"
                    style={{
                        marginBottom: 'var(--spacing-lg)',
                        display: 'inline-flex'
                    }}
                >
                    ← Geri Dön
                </Link>

                {/* Post Header */}
                <header className="animate-fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{
                        marginBottom: 'var(--spacing-md)',
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)'
                    }}>
                        {post.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            ✍️
                        </div>
                        <div>
                            <div style={{
                                fontWeight: 600,
                                color: 'var(--color-text)',
                                marginBottom: '0.25rem'
                            }}>
                                {post.username ? (
                                    <Link
                                        href={`/profile/${post.username}`}
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            transition: 'color var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--color-primary)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = 'var(--color-text)'
                                        }}
                                    >
                                        {post.nickname || post.author} ({post.username})
                                    </Link>
                                ) : (
                                    post.author
                                )}
                            </div>
                            <time
                                dateTime={post.date}
                                style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-dimmed)'
                                }}
                            >
                                {formattedDate}
                            </time>
                        </div>
                    </div>
                </header>

                {/* Post Content - XSS Protected */}
                <div
                    className="glass animate-fade-in"
                    style={{
                        padding: 'var(--spacing-xl)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--spacing-xl)'
                    }}
                >
                    <div
                        style={{
                            fontSize: '1.125rem',
                            lineHeight: '1.8',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </div>

                {/* Footer Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    <Link href="/" className="btn btn-secondary">
                        ← Tüm Yazılar
                    </Link>
                    <Link href="/create" className="btn btn-primary">
                        + Yeni Yazı Oluştur
                    </Link>
                </div>
            </article>
        </main>
    )
}
