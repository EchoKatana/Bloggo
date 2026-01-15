import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserByUsername, followUser, unfollowUser } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const session = await getSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const targetUser = getUserByUsername(params.username)

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        if (targetUser.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot follow yourself' },
                { status: 400 }
            )
        }

        followUser(session.user.id, targetUser.id)

        return NextResponse.json({
            success: true,
            followerCount: targetUser.followers.length + 1
        })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json(
            { error: 'Failed to follow user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const session = await getSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const targetUser = getUserByUsername(params.username)

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        unfollowUser(session.user.id, targetUser.id)

        return NextResponse.json({
            success: true,
            followerCount: Math.max(0, targetUser.followers.length - 1)
        })
    } catch (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json(
            { error: 'Failed to unfollow user' },
            { status: 500 }
        )
    }
}
