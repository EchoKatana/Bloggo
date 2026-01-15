import { NextAuthOptions } from 'next-auth'
import { NextRequest } from 'next/server'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, getUserByUsername } from '@/lib/db'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    const { isAccountLocked, recordFailedLogin, resetFailedLogins, isRateLimited, getClientIP, logAuditEvent } = await import('@/lib/security')

                    const username = credentials.username

                    // Check account lockout
                    const lockStatus = isAccountLocked(username)
                    if (lockStatus.locked) {
                        logAuditEvent({
                            event: 'account_locked',
                            username,
                            ipAddress: 'server',
                            success: false,
                            metadata: { remainingSeconds: lockStatus.remainingSeconds }
                        })
                        return null
                    }

                    // Rate limiting: 10 login attempts per 15 minutes per IP
                    const headers = new Headers(req?.headers || {})
                    const clientIP = getClientIP(headers)
                    if (isRateLimited(`login:${clientIP}`, 10, 900000)) {
                        logAuditEvent({
                            event: 'failed_login',
                            username,
                            ipAddress: clientIP,
                            success: false,
                            metadata: { reason: 'rate_limited' }
                        })
                        return null
                    }

                    const user = getUserByUsername(credentials.username)

                    if (!user || !user.password) {
                        recordFailedLogin(username)
                        logAuditEvent({
                            event: 'failed_login',
                            username,
                            ipAddress: clientIP,
                            success: false,
                            metadata: { reason: 'user_not_found' }
                        })
                        return null
                    }

                    const isValid = bcrypt.compareSync(credentials.password, user.password)

                    if (!isValid) {
                        const isNowLocked = recordFailedLogin(username)
                        logAuditEvent({
                            event: isNowLocked ? 'account_locked' : 'failed_login',
                            userId: user.id,
                            username: user.username,
                            email: user.email,
                            ipAddress: clientIP,
                            success: false,
                            metadata: { reason: 'invalid_password' }
                        })
                        return null
                    }

                    // Success - reset failed attempts and log
                    resetFailedLogins(username)
                    logAuditEvent({
                        event: 'login',
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        ipAddress: clientIP,
                        success: true
                    })

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                // For OAuth providers, create user if doesn't exist
                if (account?.provider === 'google' && user.email) {
                    const existingUser = getUserByEmail(user.email)

                    if (!existingUser) {
                        createUser({
                            email: user.email,
                            name: user.name || 'User',
                            image: user.image || undefined,
                        })
                    }
                }

                return true
            } catch (error) {
                console.error('Sign in error:', error)
                return false
            }
        },
        async session({ session, token }) {
            // Get user data from database using email from token
            if (token.email) {
                const dbUser = getUserByEmail(token.email as string)

                if (dbUser) {
                    session.user.id = dbUser.id
                    session.user.email = dbUser.email
                    session.user.name = dbUser.name
                    session.user.image = dbUser.image
                    session.user.username = dbUser.username
                    session.user.nickname = dbUser.nickname
                }
            }

            return session
        },
        async jwt({ token, user, account }) {
            // On initial sign in, store user email in token
            if (user) {
                token.email = user.email
            }
            return token
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // Update session every 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
