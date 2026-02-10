import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limiting - in-memory storage for API routes
// WARNING: In-memory rate limiting is unreliable in serverless environments (Vercel/Netlify).
// Each function invocation may get a fresh instance, resetting counters.
// For production reliability, migrate to an external store (e.g., Vercel KV / Upstash Redis).
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
let cleanupCounter = 0;

function cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, key) => {
        if (now > entry.resetTime) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach((key) => rateLimitMap.delete(key));
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}

/**
 * Check rate limit for a given IP
 * @param ip - Client IP address
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    ip: string,
    limit: number = 10,
    windowMs: number = 60 * 60 * 1000 // 1 hour default
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `api:${ip}`;

    let entry = rateLimitMap.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + windowMs,
        };
        rateLimitMap.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime
        };
    }

    // Increment counter
    entry.count++;

    // Cleanup every 100 requests
    cleanupCounter++;
    if (cleanupCounter % 100 === 0) {
        cleanupExpiredEntries();
    }

    return {
        allowed: true,
        remaining: limit - entry.count,
        resetTime: entry.resetTime
    };
}

/**
 * Verify Supabase authentication from Authorization header
 * Returns the user if authenticated, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<{ user: { id: string; email?: string } } | null> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return { user: { id: user.id, email: user.email } };
    } catch {
        return null;
    }
}

/**
 * Verify authenticated user is an admin.
 *
 * Uses ADMIN_EMAILS env var (comma-separated) when provided.
 * If ADMIN_EMAILS is not set, authentication alone is treated as admin access
 * to avoid accidentally locking existing deployments.
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{ user: { id: string; email?: string } } | null> {
    const auth = await verifyAuth(request);
    if (!auth) {
        return null;
    }

    const adminEmailsRaw = process.env.ADMIN_EMAILS;
    if (!adminEmailsRaw) {
        return auth;
    }

    const adminEmails = adminEmailsRaw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    const userEmail = auth.user.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
        return null;
    }

    return auth;
}

/**
 * Common prompt injection patterns used across sanitization functions.
 * NOTE: Deny-lists are inherently brittle — a determined attacker can bypass
 * them (e.g., unicode homoglyphs, Base64, foreign languages). These patterns
 * provide a reasonable first line of defense for a research bot, but should
 * NOT be relied upon for high-stakes actions.
 */
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /ignore\s+(all\s+)?prior\s+instructions/i,
    /disregard\s+(all\s+)?previous/i,
    /forget\s+(all\s+)?previous/i,
    /system\s+prompt/i,
    /you\s+are\s+now/i,
    /act\s+as\s+(a\s+)?different/i,
    /new\s+instructions/i,
    /override\s+(the\s+)?system/i,
    /jailbreak/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /do\s+not\s+follow/i,
    /bypass\s+(the\s+)?(filter|safety|rules)/i,
    /pretend\s+(you\s+are|to\s+be)/i,
    /roleplay\s+as/i,
    /enter\s+(developer|debug|admin)\s+mode/i,
];

/**
 * Check text against prompt injection patterns.
 * Returns true if injection is detected.
 */
function containsInjection(text: string): boolean {
    return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Validate and sanitize topic input for article generation
 */
export function sanitizeTopic(topic: string): { valid: boolean; sanitized: string; error?: string } {
    if (!topic || typeof topic !== 'string') {
        return { valid: false, sanitized: '', error: 'Topic is required' };
    }

    // Trim and limit length
    let sanitized = topic.trim();

    if (sanitized.length > 200) {
        return { valid: false, sanitized: '', error: 'Topic must be 200 characters or less' };
    }

    if (sanitized.length < 3) {
        return { valid: false, sanitized: '', error: 'Topic must be at least 3 characters' };
    }

    // Strip HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    if (containsInjection(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid topic content' };
    }

    return { valid: true, sanitized };
}

/**
 * Validate and sanitize message input for chat
 */
export function sanitizeMessage(message: string): { valid: boolean; sanitized: string; error?: string } {
    if (!message || typeof message !== 'string') {
        return { valid: false, sanitized: '', error: 'Message is required' };
    }

    // Trim and limit length
    let sanitized = message.trim();

    if (sanitized.length > 500) {
        return { valid: false, sanitized: '', error: 'Message must be 500 characters or less' };
    }

    if (sanitized.length < 1) {
        return { valid: false, sanitized: '', error: 'Message cannot be empty' };
    }

    // Strip HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    if (containsInjection(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid message content' };
    }

    return { valid: true, sanitized };
}

/**
 * Verify request origin matches allowed domains
 */
export function verifyOrigin(request: NextRequest, allowedHosts: string[]): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // Check origin header
    if (origin) {
        try {
            const url = new URL(origin);
            if (allowedHosts.includes(url.host)) {
                return true;
            }
        } catch {
            // Invalid origin URL
        }
    }

    // Check referer header as fallback
    if (referer) {
        try {
            const url = new URL(referer);
            if (allowedHosts.includes(url.host)) {
                return true;
            }
        } catch {
            // Invalid referer URL
        }
    }

    return false;
}
