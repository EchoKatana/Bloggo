import { NextRequest, NextResponse } from 'next/server'
import { isUsernameAvailable } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const username = searchParams.get('username')

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            )
        }

        const available = isUsernameAvailable(username)

        return NextResponse.json({ available })
    } catch (error) {
        console.error('Username check error:', error)
        return NextResponse.json(
            { error: 'Failed to check username' },
            { status: 500 }
        )
    }
}
