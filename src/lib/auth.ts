import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { getUserByEmail } from './db'

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()

    if (!session?.user?.email) {
        return null
    }

    const user = await getUserByEmail(session.user.email)
    return user
}
