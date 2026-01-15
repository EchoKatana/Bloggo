'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/db'

interface UserProfile {
    id: string
    username: string
    nickname: string
    image?: string
    followerCount: number
    followingCount: number
    postCount: number
}

interface ProfilePageProps {
    params: Promise<{
        username: string
    }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [username, setUsername] = useState<string | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    const isOwnProfile = session?.user?.username === username

    useEffect(() => {
        // Unwrap params Promise
        params.then(({ username: paramUsername }) => {
            setUsername(paramUsername)
        })
    }, [])

    useEffect(() => {
        if (username) {
            fetchProfile()
        }
    }, [username])

    const fetchProfile = async () => {
        if (!username) return

        try {
            setLoading(true)
            const response = await fetch(`/api/users/${username}`)

            if (!response.ok) {
                throw new Error('Kullanıcı bulunamadı')
            }

            const data = await response.json()
            setProfile(data.user)
            setPosts(data.posts)

            // Check if current user is following this profile
            if (session?.user?.id && data.user.id !== session.user.id) {
                // This would ideally be done via an API call, but for simplicity checking client-side
                // In production, you'd have an endpoint like /api/users/[username]/is-following
                setIsFollowing(false) // Placeholder - would need actual check
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Profil yüklenemedi')
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        if (!session) {
            router.push('/login?callbackUrl=' + encodeURIComponent(`/profile/${username}`))
            return
        }

        setFollowLoading(true)
        try {
            const response = await fetch(`/api/users/${username}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
            })

            if (!response.ok) {
                throw new Error('İşlem başarısız oldu')
            }

            const data = await response.json()
            setIsFollowing(!isFollowing)

            // Update follower count
            if (profile) {
                setProfile({
                    ...profile,
                    followerCount: data.followerCount
                })
            }
        } catch (err) {
            console.error('Follow error:', err)
            alert(err instanceof Error ? err.message : 'İşlem başarısız oldu')
        } finally {
            setFollowLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="container" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
            </main>
        )
    }

    if (error || !profile) {
        return (
            <main className="container" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="glass" style={{ padding: 'var(--spacing-xl)', maxWidth: '500px', margin: '0 auto' }}>
                    <h2>❌ Profil Bulunamadı</h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 'var(--spacing-lg) 0' }}>
                        {error || 'Aradığınız kullanıcı bulunamadı'}
                    </p>
                    <Link href="/" className="btn btn-primary">
                        ← Ana Sayfaya Dön
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="container">
            {/* Profile Header */}
            <div className="glass animate-fade-in" style={{
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-lg)',
                    flexWrap: 'wrap'
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: profile.image ? 'transparent' : 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        flexShrink: 0
                    }}>
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt={profile.nickname}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <span style={{ color: 'white' }}>
                                {profile.nickname.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '2rem' }}>
                            {profile.nickname}
                        </h1>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '1.125rem',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            {profile.username}
                        </p>

                        {/* Stats */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--spacing-lg)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>
                                    {profile.postCount}
                                </div>
                                <div style={{ color: 'var(--color-text-dimmed)', fontSize: '0.875rem' }}>
                                    Gönderi
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>
                                    {profile.followerCount}
                                </div>
                                <div style={{ color: 'var(--color-text-dimmed)', fontSize: '0.875rem' }}>
                                    Takipçi
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>
                                    {profile.followingCount}
                                </div>
                                <div style={{ color: 'var(--color-text-dimmed)', fontSize: '0.875rem' }}>
                                    Takip
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {!isOwnProfile && (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={isFollowing ? 'btn btn-secondary' : 'btn btn-primary'}
                                style={{ minWidth: '150px' }}
                            >
                                {followLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}>
                                        <span className="spinner" style={{
                                            width: '16px',
                                            height: '16px',
                                            borderWidth: '2px'
                                        }}></span>
                                    </span>
                                ) : isFollowing ? (
                                    '✓ Takip Ediliyor'
                                ) : (
                                    '+ Takip Et'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div>
                <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.5rem' }}>
                    {isOwnProfile ? 'Yazılarınız' : `${profile.nickname} adlı kullanıcının yazıları`}
                </h2>

                {posts.length === 0 ? (
                    <div className="glass" style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-2xl)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            {isOwnProfile ? 'Henüz yazı paylaşmadınız.' : 'Bu kullanıcı henüz yazı paylaşmamış.'}
                        </p>
                        {isOwnProfile && (
                            <Link href="/create" className="btn btn-primary">
                                İlk Yazınızı Oluşturun
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 'var(--spacing-lg)'
                    }}>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
