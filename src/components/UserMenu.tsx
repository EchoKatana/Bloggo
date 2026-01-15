'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface UserMenuProps {
    user: {
        name?: string | null
        nickname: string
        username: string
        image?: string | null
    }
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' })
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                className="glass"
            >
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.nickname}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        {user.nickname.charAt(0).toUpperCase()}
                    </div>
                )}
                <span style={{
                    fontWeight: '500',
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {user.nickname}
                </span>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                >
                    <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 40
                        }}
                    />

                    {/* Menu */}
                    <div
                        className="glass animate-fade-in"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            minWidth: '250px',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-lg)',
                            zIndex: 50,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        {/* User Info */}
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderBottom: '1px solid var(--glass-border)',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '1rem',
                                marginBottom: 'var(--spacing-xs)'
                            }}>
                                {user.nickname}
                            </div>
                            <div style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '0.875rem'
                            }}>
                                {user.username}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <Link
                            href={`/profile/${user.username}`}
                            onClick={() => setIsOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2.5 1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h5zM3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" />
                            </svg>
                            <span>Profilim</span>
                        </Link>

                        <button
                            onClick={handleSignOut}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.2s ease',
                                fontSize: '1rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z" />
                                <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" />
                            </svg>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
