import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers

    // Content Security Policy - Prevent XSS attacks
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline in dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
        ].join('; ')
    )

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions Policy - Disable unnecessary browser features
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    )

    // XSS Protection (legacy, but still good to have)
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}

// Apply middleware to all routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
