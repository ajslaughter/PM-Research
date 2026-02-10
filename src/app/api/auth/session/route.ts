import { NextRequest, NextResponse } from 'next/server';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
    try {
        const { accessToken, refreshToken } = await request.json();

        if (!accessToken || !refreshToken) {
            return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true });

        response.cookies.set('sb-access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE_SECONDS,
        });

        response.cookies.set('sb-refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE_SECONDS,
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });

    response.cookies.set('sb-access-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    response.cookies.set('sb-refresh-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}
