import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const DATA_DIR = path.join(process.cwd(), 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// ============ INTERFACES ============

export interface User {
    id: string
    email: string
    name: string
    image?: string
    username: string // @username format
    nickname: string // Display name
    password?: string // Hashed password (only for credentials login)
    followers: string[] // Array of user IDs
    following: string[] // Array of user IDs
    createdAt: string
}

export interface Post {
    id: string
    title: string
    content: string
    author: string // Deprecated - kept for backward compatibility
    userId: string
    username: string // @username
    nickname: string // Display name
    date: string
    excerpt?: string
}

// ============ HELPERS ============

const ensureDataDir = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(POSTS_FILE)) {
        fs.writeFileSync(POSTS_FILE, '[]', 'utf-8')
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]', 'utf-8')
    }
}

// ============ USER FUNCTIONS ============

export const getAllUsers = (): User[] => {
    try {
        ensureDataDir()
        const fileContent = fs.readFileSync(USERS_FILE, 'utf-8')
        return JSON.parse(fileContent) as User[]
    } catch (error) {
        console.error('Error reading users:', error)
        return []
    }
}

const saveUsers = (users: User[]): void => {
    try {
        ensureDataDir()
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
    } catch (error) {
        console.error('Error saving users:', error)
        throw new Error('Failed to save users')
    }
}

export const getUserByEmail = (email: string): User | null => {
    const users = getAllUsers()
    return users.find(user => user.email === email) || null
}

export const getUserById = (id: string): User | null => {
    const users = getAllUsers()
    return users.find(user => user.id === id) || null
}

export const getUserByUsername = (username: string): User | null => {
    const users = getAllUsers()
    // Ensure username comparison is case-insensitive and handles @ prefix
    const normalizedSearch = username.toLowerCase().startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`
    return users.find(user => user.username.toLowerCase() === normalizedSearch) || null
}

export const isUsernameAvailable = (username: string): boolean => {
    return getUserByUsername(username) === null
}

export const createUser = (userData: {
    email: string
    name: string
    image?: string
    username?: string
    nickname?: string
    password?: string
}): User => {
    try {
        ensureDataDir()
        const users = getAllUsers()

        // Hash password if provided
        let hashedPassword: string | undefined
        if (userData.password) {
            hashedPassword = bcrypt.hashSync(userData.password, 10)
        }

        const newUser: User = {
            id: uuidv4(),
            email: userData.email,
            name: userData.name,
            image: userData.image,
            username: userData.username || '', // Will be set during profile setup
            nickname: userData.nickname || userData.name, // Default to name
            password: hashedPassword,
            followers: [],
            following: [],
            createdAt: new Date().toISOString(),
        }

        users.push(newUser)
        saveUsers(users)

        return newUser
    } catch (error) {
        console.error('Error creating user:', error)
        throw new Error('Failed to create user')
    }
}

export const updateUserProfile = (userId: string, updates: {
    username?: string
    nickname?: string
}): User => {
    try {
        const users = getAllUsers()
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            throw new Error('User not found')
        }

        // Check username availability if changing username
        if (updates.username && updates.username !== users[userIndex].username) {
            if (!isUsernameAvailable(updates.username)) {
                throw new Error('Username already taken')
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updates
        }

        saveUsers(users)
        return users[userIndex]
    } catch (error) {
        console.error('Error updating user profile:', error)
        throw error
    }
}

export const followUser = (followerId: string, followeeId: string): void => {
    try {
        const users = getAllUsers()
        const followerIndex = users.findIndex(u => u.id === followerId)
        const followeeIndex = users.findIndex(u => u.id === followeeId)

        if (followerIndex === -1 || followeeIndex === -1) {
            throw new Error('User not found')
        }

        // Add to following list (if not already following)
        if (!users[followerIndex].following.includes(followeeId)) {
            users[followerIndex].following.push(followeeId)
        }

        // Add to followers list
        if (!users[followeeIndex].followers.includes(followerId)) {
            users[followeeIndex].followers.push(followerId)
        }

        saveUsers(users)
    } catch (error) {
        console.error('Error following user:', error)
        throw error
    }
}

export const unfollowUser = (followerId: string, followeeId: string): void => {
    try {
        const users = getAllUsers()
        const followerIndex = users.findIndex(u => u.id === followerId)
        const followeeIndex = users.findIndex(u => u.id === followeeId)

        if (followerIndex === -1 || followeeIndex === -1) {
            throw new Error('User not found')
        }

        // Remove from following list
        users[followerIndex].following = users[followerIndex].following.filter(id => id !== followeeId)

        // Remove from followers list
        users[followeeIndex].followers = users[followeeIndex].followers.filter(id => id !== followerId)

        saveUsers(users)
    } catch (error) {
        console.error('Error unfollowing user:', error)
        throw error
    }
}

export const getFollowers = (userId: string): User[] => {
    const user = getUserById(userId)
    if (!user) return []

    return user.followers.map(id => getUserById(id)).filter((u): u is User => u !== null)
}

export const getFollowing = (userId: string): User[] => {
    const user = getUserById(userId)
    if (!user) return []

    return user.following.map(id => getUserById(id)).filter((u): u is User => u !== null)
}

export const isFollowing = (followerId: string, followeeId: string): boolean => {
    const follower = getUserById(followerId)
    if (!follower) return false

    return follower.following.includes(followeeId)
}

export const initializeAdminAccount = (): void => {
    try {
        const adminUsername = '@admin'
        const existingAdmin = getUserByUsername(adminUsername)

        if (!existingAdmin) {
            // Get admin password from environment variable
            const adminPassword = process.env.ADMIN_PASSWORD

            if (!adminPassword) {
                console.warn('⚠️  ADMIN_PASSWORD not set in environment variables. Admin account not created.')
                console.warn('📝 Set ADMIN_PASSWORD in .env.local to create admin account')
                return
            }

            createUser({
                email: 'admin@blogapp.local',
                name: 'Admin',
                username: adminUsername,
                nickname: 'Admin',
                password: adminPassword
            })
            console.log('✅ Admin account created successfully')
        }
    } catch (error) {
        console.error('Error initializing admin account:', error)
    }
}

// ============ POST FUNCTIONS ============

export const getAllPosts = (): Post[] => {
    try {
        ensureDataDir()
        const fileContent = fs.readFileSync(POSTS_FILE, 'utf-8')
        const posts = JSON.parse(fileContent) as Post[]
        // Sort by date, newest first
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
        console.error('Error reading posts:', error)
        return []
    }
}

export const getPostById = (id: string): Post | null => {
    try {
        const posts = getAllPosts()
        return posts.find(post => post.id === id) || null
    } catch (error) {
        console.error('Error getting post by id:', error)
        return null
    }
}

export const getPostsByUserId = (userId: string): Post[] => {
    try {
        const posts = getAllPosts()
        return posts.filter(post => post.userId === userId)
    } catch (error) {
        console.error('Error getting posts by user id:', error)
        return []
    }
}

export const createPost = (postData: {
    title: string
    content: string
    userId: string
    username: string
    nickname: string
}): Post => {
    try {
        ensureDataDir()
        const posts = getAllPosts()

        // Create excerpt from content (first 150 characters)
        const excerpt = postData.content.substring(0, 150) + (postData.content.length > 150 ? '...' : '')

        const newPost: Post = {
            id: uuidv4(),
            title: postData.title,
            content: postData.content,
            author: postData.nickname, // For backward compatibility
            userId: postData.userId,
            username: postData.username,
            nickname: postData.nickname,
            excerpt,
            date: new Date().toISOString(),
        }

        posts.push(newPost)
        savePosts(posts)

        return newPost
    } catch (error) {
        console.error('Error creating post:', error)
        throw new Error('Failed to create post')
    }
}

const savePosts = (posts: Post[]): void => {
    try {
        ensureDataDir()
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8')
    } catch (error) {
        console.error('Error saving posts:', error)
        throw new Error('Failed to save posts')
    }
}

// Initialize admin account on module load
initializeAdminAccount()
