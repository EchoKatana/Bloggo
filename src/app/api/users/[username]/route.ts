import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, getPostsByUserId, getFollowerCount, getFollowingCount } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params

        const user = await getUserByUsername(username)

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const posts = await getPostsByUserId(user.id)
        const followerCount = await getFollowerCount(user.id)
        const followingCount = await getFollowingCount(user.id)

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                image: user.image,
                followerCount,
                followingCount,
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
