import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, createPost } from '@/lib/db'
import {
    isRateLimited,
    getClientIP,
    validatePostData,
    sanitizeInput
} from '@/lib/security'

// GET /api/posts - Get all posts
export async function GET() {
    try {
        const posts = getAllPosts()
        return NextResponse.json({ success: true, posts })
    } catch (error) {
        console.error('GET /api/posts error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch posts' },
            { status: 500 }
        )
    }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        // Import getSession here to avoid circular dependencies
        const { getSession } = await import('@/lib/auth')

        // Check authentication
        const session = await getSession()
        if (!session?.user || !session.user.id) {
            return NextResponse.json(
                { success: false, error: 'You must be logged in to create a post' },
                { status: 401 }
            )
        }

        // Check if user has set up their profile
        if (!session.user.username || !session.user.nickname) {
            return NextResponse.json(
                { success: false, error: 'Please complete your profile setup before creating posts' },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Validate input data (modified - no author field needed)
        if (!body.title || !body.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Title and content are required'
                },
                { status: 400 }
            )
        }

        // Sanitize inputs
        const sanitizedTitle = sanitizeInput(body.title, 200)
        const sanitizedContent = sanitizeInput(body.content, 50000)

        // Additional security check - prevent extremely long inputs
        if (sanitizedTitle.length > 200 || sanitizedContent.length > 50000) {
            return NextResponse.json(
                { success: false, error: 'Input exceeds maximum allowed length' },
                { status: 400 }
            )
        }

        const newPost = createPost({
            title: sanitizedTitle,
            content: sanitizedContent,
            userId: session.user.id,
            username: session.user.username,
            nickname: session.user.nickname,
        })

        return NextResponse.json(
            { success: true, post: newPost },
            { status: 201 }
        )
    } catch (error) {
        console.error('POST /api/posts error:', error)

        // Don't expose internal error details
        return NextResponse.json(
            { success: false, error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
