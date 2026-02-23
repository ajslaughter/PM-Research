import { NextResponse } from 'next/server';

/**
 * GET /api/auth/check
 * Server-side health check that validates Supabase configuration and connectivity.
 * Returns a diagnostic so the signup/login pages can show actionable errors.
 */
export async function GET() {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

    // Check 1: Are env vars set at all?
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            ok: false,
            code: 'NOT_CONFIGURED',
            message: 'Supabase environment variables are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel project settings (or .env.local for local dev).',
        });
    }

    // Check 2: Are they still placeholder values?
    if (
        supabaseUrl.includes('your-project') ||
        supabaseUrl.includes('placeholder') ||
        supabaseKey === 'eyJ...' ||
        supabaseKey.length < 30
    ) {
        return NextResponse.json({
            ok: false,
            code: 'PLACEHOLDER_VALUES',
            message: 'Supabase environment variables are still set to placeholder/example values. Replace them with your real Supabase project URL and anon key from supabase.com/dashboard.',
        });
    }

    // Check 3: Is the URL a valid Supabase URL?
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(supabaseUrl);
    } catch {
        return NextResponse.json({
            ok: false,
            code: 'INVALID_URL',
            message: `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${supabaseUrl}". It should look like https://abcdefg.supabase.co`,
        });
    }

    // Check 4: Can we actually reach the Supabase auth endpoint?
    try {
        const healthUrl = `${parsedUrl.origin}/auth/v1/health`;
        const res = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
            return NextResponse.json({ ok: true, code: 'HEALTHY' });
        }

        // Supabase returned an error
        const text = await res.text().catch(() => '');
        if (res.status === 401 || res.status === 403) {
            return NextResponse.json({
                ok: false,
                code: 'BAD_KEY',
                message: 'Supabase rejected the anon key. Check that NEXT_PUBLIC_SUPABASE_ANON_KEY matches your project\'s anon/public key from supabase.com/dashboard > Settings > API.',
            });
        }

        return NextResponse.json({
            ok: false,
            code: 'AUTH_ERROR',
            message: `Supabase auth returned status ${res.status}. ${text ? 'Details: ' + text.slice(0, 200) : 'The project may be paused — check your Supabase dashboard.'}`,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.includes('timeout') || message.includes('abort')) {
            return NextResponse.json({
                ok: false,
                code: 'TIMEOUT',
                message: 'Supabase is not responding (timed out after 5s). Your project may be paused — go to supabase.com/dashboard and check if it needs to be restored.',
            });
        }

        return NextResponse.json({
            ok: false,
            code: 'UNREACHABLE',
            message: `Cannot reach Supabase at ${parsedUrl.origin}. Check that NEXT_PUBLIC_SUPABASE_URL is correct and the project is active. Error: ${message}`,
        });
    }
}
