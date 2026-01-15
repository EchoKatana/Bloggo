import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserByUsername, followUser, unfollowUser } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const session = await getSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const targetUser = await getUserByUsername(username)

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

        await followUser(session.user.id, targetUser.id)
        const followerCount = await import('@/lib/db').then(mod =>
            mod.getFollowerCount(targetUser.id)
        )

        return NextResponse.json({
            success: true,
            followerCount
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
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const session = await getSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const targetUser = await getUserByUsername(username)

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        await unfollowUser(session.user.id, targetUser.id)
        const followerCount = await import('@/lib/db').then(mod =>
            mod.getFollowerCount(targetUser.id)
        )

        return NextResponse.json({
            success: true,
            followerCount
        })
    } catch (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json(
            { error: 'Failed to unfollow user' },
            { status: 500 }
        )
    }
}
