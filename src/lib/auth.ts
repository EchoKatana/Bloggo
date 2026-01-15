import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByEmail } from './db'

export { authOptions }

export async function getCurrentUser() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return null
    }

    const user = getUserByEmail(session.user.email)
    return user
}

export async function getSession() {
    return await getServerSession(authOptions)
}
