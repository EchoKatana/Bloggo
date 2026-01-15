import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// ============ TYPES ============
type PrismaUser = {
    id: string
    email: string
    name: string | null
    username: string
    nickname: string
    password: string | null
    image: string | null
    createdAt: Date
    updatedAt: Date
}

type PrismaPost = {
    id: string
    title: string
    content: string
    userId: string
    author: string
    username: string
    nickname: string
    date: Date
    createdAt: Date
    updatedAt: Date
}

type PrismaFollow = {
    id: string
    followerId: string
    followingId: string
    createdAt: Date
}

// ============ TYPES ============

export type User = PrismaUser
export type Post = PrismaPost
export type Follow = PrismaFollow

// ============ USER FUNCTIONS ============

export const getAllUsers = async (): Promise<User[]> => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email }
    })
}

export const getUserById = async (id: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { id }
    })
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
    // Normalize username (ensure @ prefix and lowercase)
    const normalizedUsername = username.toLowerCase().startsWith('@')
        ? username.toLowerCase()
        : `@${username.toLowerCase()}`

    return await prisma.user.findUnique({
        where: { username: normalizedUsername }
    })
}

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
    const user = await getUserByUsername(username)
    return user === null
}

export const createUser = async (userData: {
    email: string
    name: string
    image?: string
    username?: string
    nickname?: string
    password?: string
}): Promise<User> => {
    // Hash password if provided
    const hashedPassword = userData.password
        ? bcrypt.hashSync(userData.password, 10)
        : undefined

    return await prisma.user.create({
        data: {
            email: userData.email,
            name: userData.name,
            image: userData.image,
            username: userData.username || '',
            nickname: userData.nickname || userData.name,
            password: hashedPassword,
        }
    })
}

export const updateUserProfile = async (
    userId: string,
    updates: {
        username?: string
        nickname?: string
        name?: string
        image?: string
    }
): Promise<User> => {
    return await prisma.user.update({
        where: { id: userId },
        data: updates
    })
}

// ============ FOLLOW FUNCTIONS ============

export const followUser = async (followerId: string, followingId: string): Promise<Follow> => {
    if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
    }

    return await prisma.follow.create({
        data: {
            followerId,
            followingId
        }
    })
}

export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
    await prisma.follow.deleteMany({
        where: {
            followerId,
            followingId
        }
    })
}

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
    const follow = await prisma.follow.findFirst({
        where: {
            followerId,
            followingId
        }
    })
    return follow !== null
}

export const getFollowers = async (userId: string): Promise<User[]> => {
    const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: true }
    })
    return follows.map(f => f.follower)
}

export const getFollowing = async (userId: string): Promise<User[]> => {
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: true }
    })
    return follows.map(f => f.following)
}

export const getFollowerCount = async (userId: string): Promise<number> => {
    return await prisma.follow.count({
        where: { followingId: userId }
    })
}

export const getFollowingCount = async (userId: string): Promise<number> => {
    return await prisma.follow.count({
        where: { followerId: userId }
    })
}

// ============ POST FUNCTIONS ============

export const getAllPosts = async (): Promise<Post[]> => {
    return await prisma.post.findMany({
        orderBy: { date: 'desc' },
        include: { user: true }
    })
}

export const getPostById = async (id: string): Promise<Post | null> => {
    return await prisma.post.findUnique({
        where: { id },
        include: { user: true }
    })
}

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
    return await prisma.post.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    })
}

export const createPost = async (postData: {
    title: string
    content: string
    userId: string
    username: string
    nickname: string
    author?: string
}): Promise<Post> => {
    const excerpt = postData.content.substring(0, 150) + (postData.content.length > 150 ? '...' : '')

    return await prisma.post.create({
        data: {
            title: postData.title,
            content: postData.content,
            userId: postData.userId,
            username: postData.username,
            nickname: postData.nickname,
            author: postData.author || postData.nickname,
        }
    })
}

export const updatePost = async (
    id: string,
    updates: {
        title?: string
        content?: string
    }
): Promise<Post> => {
    return await prisma.post.update({
        where: { id },
        data: updates
    })
}

export const deletePost = async (id: string): Promise<void> => {
    await prisma.post.delete({
        where: { id }
    })
}

export const getPostCount = async (userId: string): Promise<number> => {
    return await prisma.post.count({
        where: { userId }
    })
}

// ============ SEARCH FUNCTIONS ============

export const searchPosts = async (query: string): Promise<Post[]> => {
    return await prisma.post.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ]
        },
        orderBy: { date: 'desc' },
        take: 50
    })
}

export const searchUsers = async (query: string): Promise<User[]> => {
    return await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { nickname: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 20
    })
}

// ============ ADMIN INITIALIZATION ============

export const initializeAdminAccount = async () => {
    try {
        const adminUsername = '@admin'
        const existingAdmin = await getUserByUsername(adminUsername)

        if (!existingAdmin) {
            // Get admin password from environment variable
            const adminPassword = process.env.ADMIN_PASSWORD

            if (!adminPassword) {
                console.warn('⚠️  ADMIN_PASSWORD not set in environment variables. Admin account not created.')
                console.warn('📝 Set ADMIN_PASSWORD in .env.local to create admin account')
                return
            }

            await createUser({
                email: 'admin@blogapp.local',
                name: 'Admin',
                username: adminUsername,
                nickname: 'Admin',
                password: adminPassword
            })
            console.log('✅ Admin account created successfully')
        }
    } catch (error) {
        console.error('❌ Error initializing admin account:', error)
    }
}

// Initialize admin on module load (server startup)
initializeAdminAccount()
