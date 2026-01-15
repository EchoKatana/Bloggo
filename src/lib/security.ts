// Security utilities for the blog application

// Simple in-memory rate limiter
interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Rate limiter - limits requests per IP
 * @param key - Unique identifier (e.g., IP address)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function isRateLimited(
    key: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
        // New entry or expired window
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        })
        return false
    }

    if (entry.count >= limit) {
        return true // Rate limit exceeded
    }

    // Increment count
    entry.count++
    return false
}

/**
 * Clean up expired rate limit entries (optional, for memory management)
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

/**
 * Sanitize string input - remove potentially dangerous characters
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength?: number): string {
    let sanitized = input.trim()

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '')

    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string): string {
    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    }

    return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * Validate post data
 * @param data - Post data to validate
 * @returns Validation result with errors
 */
export function validatePostData(data: {
    title?: string
    content?: string
    author?: string
}): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Title validation
    if (!data.title || typeof data.title !== 'string') {
        errors.push('Title is required and must be a string')
    } else {
        const trimmedTitle = data.title.trim()
        if (trimmedTitle.length < 3) {
            errors.push('Title must be at least 3 characters long')
        }
        if (trimmedTitle.length > 200) {
            errors.push('Title must not exceed 200 characters')
        }
    }

    // Content validation
    if (!data.content || typeof data.content !== 'string') {
        errors.push('Content is required and must be a string')
    } else {
        const trimmedContent = data.content.trim()
        if (trimmedContent.length < 10) {
            errors.push('Content must be at least 10 characters long')
        }
        if (trimmedContent.length > 50000) {
            errors.push('Content must not exceed 50,000 characters')
        }
    }

    // Author validation
    if (!data.author || typeof data.author !== 'string') {
        errors.push('Author is required and must be a string')
    } else {
        const trimmedAuthor = data.author.trim()
        if (trimmedAuthor.length < 2) {
            errors.push('Author name must be at least 2 characters long')
        }
        if (trimmedAuthor.length > 100) {
            errors.push('Author name must not exceed 100 characters')
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Validate UUID format
 * @param id - ID to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

/**
 * Get client IP from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIP(headers: Headers): string {
    // Check common headers for client IP
    const forwarded = headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIp = headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    // Fallback to a generic identifier
    return 'unknown'
}

// ========================================
//  ACCOUNT LOCKOUT SYSTEM
// ========================================

interface LockoutEntry {
    failedAttempts: number
    lockedUntil: number | null
    lastAttempt: number
}

const lockoutStore = new Map<string, LockoutEntry>()

/**
 * Record a failed login attempt
 * @param identifier - Username or email
 * @returns true if account is now locked, false otherwise
 */
export function recordFailedLogin(identifier: string): boolean {
    const now = Date.now()
    const entry = lockoutStore.get(identifier)

    if (!entry) {
        lockoutStore.set(identifier, {
            failedAttempts: 1,
            lockedUntil: null,
            lastAttempt: now,
        })
        return false
    }

    // If locked, check if lock has expired
    if (entry.lockedUntil && now < entry.lockedUntil) {
        return true // Still locked
    }

    // If lock expired, reset
    if (entry.lockedUntil && now >= entry.lockedUntil) {
        entry.failedAttempts = 1
        entry.lockedUntil = null
        entry.lastAttempt = now
        return false
    }

    // Increment failed attempts
    entry.failedAttempts++
    entry.lastAttempt = now

    // Lock account after 5 failed attempts for 1 minute
    if (entry.failedAttempts >= 5) {
        entry.lockedUntil = now + 60000 // 1 minute
        return true
    }

    return false
}

/**
 * Check if account is locked
 * @param identifier - Username or email
 * @returns Object with lock status and remaining time
 */
export function isAccountLocked(identifier: string): {
    locked: boolean
    remainingSeconds?: number
} {
    const entry = lockoutStore.get(identifier)

    if (!entry || !entry.lockedUntil) {
        return { locked: false }
    }

    const now = Date.now()

    if (now >= entry.lockedUntil) {
        // Lock expired
        entry.lockedUntil = null
        entry.failedAttempts = 0
        return { locked: false }
    }

    const remainingMs = entry.lockedUntil - now
    const remainingSeconds = Math.ceil(remainingMs / 1000)

    return { locked: true, remainingSeconds }
}

/**
 * Reset failed login attempts (called on successful login)
 * @param identifier - Username or email
 */
export function resetFailedLogins(identifier: string): void {
    lockoutStore.delete(identifier)
}

/**
 * Cleanup expired lockout entries
 */
export function cleanupLockoutStore(): void {
    const now = Date.now()
    for (const [key, entry] of lockoutStore.entries()) {
        if (entry.lockedUntil && now > entry.lockedUntil + 300000) { // 5 min after unlock
            lockoutStore.delete(key)
        }
    }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupLockoutStore, 5 * 60 * 1000)
}

// ========================================
//  AUDIT LOGGING
// ========================================

export interface AuditLog {
    id: string
    timestamp: string
    event: 'login' | 'logout' | 'register' | 'failed_login' | 'account_locked'
    userId?: string
    username?: string
    email?: string
    ipAddress: string
    userAgent?: string
    success: boolean
    metadata?: Record<string, any>
}

const auditLogs: AuditLog[] = []
const MAX_LOGS = 1000 // Keep last 1000 logs in memory

/**
 * Log an audit event
 * @param event - Event details
 */
export function logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logEntry: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...event,
    }

    auditLogs.unshift(logEntry)

    // Keep only last MAX_LOGS entries
    if (auditLogs.length > MAX_LOGS) {
        auditLogs.splice(MAX_LOGS)
    }

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUDIT] ${logEntry.event} - ${logEntry.username || logEntry.email || 'unknown'} - ${logEntry.success ? 'SUCCESS' : 'FAILED'}`)
    }
}

/**
 * Get recent audit logs
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export function getAuditLogs(limit: number = 50): AuditLog[] {
    return auditLogs.slice(0, limit)
}

/**
 * Get audit logs for a specific user
 * @param userId - User ID
 * @param limit - Maximum number of logs
 * @returns Array of audit logs for the user
 */
export function getUserAuditLogs(userId: string, limit: number = 50): AuditLog[] {
    return auditLogs.filter(log => log.userId === userId).slice(0, limit)
}
