import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, getPostsByUserId } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username

        const user = getUserByUsername(username)

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const posts = getPostsByUserId(user.id)

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                image: user.image,
                followerCount: user.followers.length,
                followingCount: user.following.length,
                postCount: posts.length
            },
            posts
        })
    } catch (error) {
        console.error('User profile error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        )
    }
}
