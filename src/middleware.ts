import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Middleware runs on the edge, so we need to create a minimal client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(request: NextRequest) {
    // Only protect /admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Check for Supabase auth tokens in cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    // If no tokens, redirect to login
    if (!accessToken || !refreshToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify the session with Supabase
    if (supabaseUrl && supabaseAnonKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            });

            const { data: { user }, error } = await supabase.auth.getUser(accessToken);

            if (error || !user) {
                // Invalid session, redirect to login
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
                const response = NextResponse.redirect(loginUrl);

                // Clear invalid cookies
                response.cookies.delete('sb-access-token');
                response.cookies.delete('sb-refresh-token');

                return response;
            }

            // Valid session, continue
            return NextResponse.next();
        } catch {
            // On error, redirect to login
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If Supabase not configured, allow access (development mode)
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
