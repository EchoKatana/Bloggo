import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, isUsernameAvailable } from '@/lib/db'
import { isRateLimited, getClientIP, logAuditEvent } from '@/lib/security'

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 5 registration attempts per hour per IP
        const clientIP = getClientIP(request.headers)
        if (isRateLimited(`register:${clientIP}`, 5, 3600000)) {
            return NextResponse.json(
                { error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { email, password, username, nickname } = body

        // Validation
        if (!email || !password || !username || !nickname) {
            return NextResponse.json(
                { error: 'Tüm alanlar zorunludur' },
                { status: 400 }
            )
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Geçersiz email formatı' },
                { status: 400 }
            )
        }

        // Password validation - stronger requirements
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Şifre en az 8 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return NextResponse.json(
                { error: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir' },
                { status: 400 }
            )
        }

        // Username validation
        if (!username.startsWith('@')) {
            return NextResponse.json(
                { error: 'Kullanıcı adı @ ile başlamalıdır' },
                { status: 400 }
            )
        }

        if (username.length < 4) {
            return NextResponse.json(
                { error: 'Kullanıcı adı en az 4 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Nickname validation
        if (nickname.length < 2) {
            return NextResponse.json(
                { error: 'Takma ad en az 2 karakter olmalıdır' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            return NextResponse.json(
                { error: 'Bu email adresi zaten kullanılıyor' },
                { status: 409 }
            )
        }

        // Check if username is available
        if (!(await isUsernameAvailable(username))) {
            return NextResponse.json(
                { error: 'Bu kullanıcı adı zaten kullanılıyor' },
                { status: 409 }
            )
        }

        // Create user
        const newUser = await createUser({
            email,
            password,
            name: nickname,
            username,
            nickname,
        })

        // Log successful registration
        logAuditEvent({
            event: 'register',
            userId: newUser.id,
            username: newUser.username,
            email: newUser.email,
            ipAddress: clientIP,
            success: true
        })

        return NextResponse.json({
            success: true,
            message: 'Hesap başarıyla oluşturuldu',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                nickname: newUser.nickname,
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Kayıt sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
