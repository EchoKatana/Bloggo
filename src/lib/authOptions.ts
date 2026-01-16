import { NextAuthOptions } from 'next-auth'
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
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    const user = await getUserByUsername(credentials.username)

                    if (!user || !user.password) {
                        return null
                    }

                    const isValid = bcrypt.compareSync(credentials.password, user.password)

                    if (!isValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    }
                } catch (error) {
                    console.error('Credentials auth error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (account?.provider === 'google') {
                    const existingUser = await getUserByEmail(user.email!)

                    if (!existingUser) {
                        await createUser({
                            email: user.email!,
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
            if (token.email) {
                const dbUser = await getUserByEmail(token.email as string)

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
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
