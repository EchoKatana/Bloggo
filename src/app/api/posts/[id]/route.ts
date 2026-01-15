import { NextRequest, NextResponse } from 'next/server'
import { getPostById } from '@/lib/db'
import { isValidUUID } from '@/lib/security'

// GET /api/posts/[id] - Get a single post by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Validate UUID format to prevent injection attacks
        if (!isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid post ID format' },
                { status: 400 }
            )
        }

        const post = getPostById(id)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, post })
    } catch (error) {
        console.error('GET /api/posts/[id] error:', error)

        // Don't expose internal error details
        return NextResponse.json(
            { success: false, error: 'Failed to fetch post' },
            { status: 500 }
        )
    }
}
