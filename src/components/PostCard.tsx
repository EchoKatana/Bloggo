'use client'

import Link from 'next/link'
import type { Post } from '@/lib/db'

interface PostCardProps {
    post: Post
}

export default function PostCard({ post }: PostCardProps) {
    const formattedDate = new Date(post.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <article className="card animate-fade-in">
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.75rem' }}>
                    <Link
                        href={`/post/${post.id}`}
                        style={{
                            color: 'var(--color-text)',
                            transition: 'color var(--transition-base)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text)'
                        }}
                    >
                        {post.title}
                    </Link>
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-dimmed)'
                }}>
                    <span>✍️</span>
                    {post.username ? (
                        <Link
                            href={`/profile/${post.username}`}
                            style={{
                                color: 'var(--color-text-dimmed)',
                                textDecoration: 'none',
                                transition: 'color var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-primary)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-dimmed)'
                            }}
                        >
                            {post.nickname || post.author}
                        </Link>
                    ) : (
                        <span>{post.author}</span>
                    )}
                    <span>•</span>
                    <time dateTime={post.date}>{formattedDate}</time>
                </div>
            </div>

            {post.excerpt && (
                <p style={{
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-md)',
                    lineHeight: '1.7'
                }}>
                    {post.excerpt}
                </p>
            )}

            <Link href={`/post/${post.id}`} className="btn btn-secondary">
                Devamını Oku →
            </Link>
        </article>
    )
}
