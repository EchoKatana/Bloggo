import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateUserProfile, isUsernameAvailable } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { username, nickname } = body

        // Validate inputs
        if (!username || !nickname) {
            return NextResponse.json(
                { error: 'Username and nickname are required' },
                { status: 400 }
            )
        }

        // Validate username format
        if (!username.startsWith('@')) {
            return NextResponse.json(
                { error: 'Username must start with @' },
                { status: 400 }
            )
        }

        if (username.length < 4) {
            return NextResponse.json(
                { error: 'Username must be at least 4 characters long (including @)' },
                { status: 400 }
            )
        }

        // Check username availability
        if (!isUsernameAvailable(username)) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 409 }
            )
        }

        // Update user profile
        const updatedUser = await updateUserProfile(session.user.id, {
            username,
            nickname
        })

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                nickname: updatedUser.nickname
            }
        })
    } catch (error) {
        console.error('Profile setup error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to setup profile' },
            { status: 500 }
        )
    }
}
