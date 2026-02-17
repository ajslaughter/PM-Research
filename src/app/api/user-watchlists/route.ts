import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/security';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// GET /api/user-watchlists - Fetch all watchlists for the authenticated user
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Use the user's JWT to respect RLS
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { autoRefreshToken: false, persistSession: false },
        }
    );

    const { data, error } = await userClient
        .from('user_portfolios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ watchlists: data || [] });
}

// POST /api/user-watchlists - Create a new watchlist
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, description, positions } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Watchlist name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Watchlist name must be 100 characters or less' }, { status: 400 });
    }

    if (!Array.isArray(positions) || positions.length === 0) {
        return NextResponse.json({ error: 'At least one position is required' }, { status: 400 });
    }

    if (positions.length > 50) {
        return NextResponse.json({ error: 'Maximum 50 positions per watchlist' }, { status: 400 });
    }

    // Validate each position
    for (const pos of positions) {
        if (!pos.ticker || typeof pos.ticker !== 'string') {
            return NextResponse.json({ error: 'Each position must have a ticker' }, { status: 400 });
        }
        if (typeof pos.weight !== 'number' || pos.weight <= 0 || pos.weight > 100) {
            return NextResponse.json({ error: 'Each position weight must be between 0 and 100' }, { status: 400 });
        }
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { autoRefreshToken: false, persistSession: false },
        }
    );

    const { data, error } = await userClient
        .from('user_portfolios')
        .insert({
            user_id: auth.user.id,
            name: name.trim(),
            description: (description || '').trim().slice(0, 500),
            positions: positions.map((p: { ticker: string; weight: number }) => ({
                ticker: p.ticker.toUpperCase().trim(),
                weight: Math.round(p.weight * 100) / 100,
            })),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ watchlist: data }, { status: 201 });
}

// PUT /api/user-watchlists - Update an existing watchlist
export async function PUT(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, name, description, positions } = body;

    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Watchlist ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Watchlist name cannot be empty' }, { status: 400 });
        }
        if (name.trim().length > 100) {
            return NextResponse.json({ error: 'Watchlist name must be 100 characters or less' }, { status: 400 });
        }
        updates.name = name.trim();
    }

    if (description !== undefined) {
        updates.description = (description || '').trim().slice(0, 500);
    }

    if (positions !== undefined) {
        if (!Array.isArray(positions) || positions.length === 0) {
            return NextResponse.json({ error: 'At least one position is required' }, { status: 400 });
        }
        if (positions.length > 50) {
            return NextResponse.json({ error: 'Maximum 50 positions per watchlist' }, { status: 400 });
        }
        for (const pos of positions) {
            if (!pos.ticker || typeof pos.ticker !== 'string') {
                return NextResponse.json({ error: 'Each position must have a ticker' }, { status: 400 });
            }
            if (typeof pos.weight !== 'number' || pos.weight <= 0 || pos.weight > 100) {
                return NextResponse.json({ error: 'Each position weight must be between 0 and 100' }, { status: 400 });
            }
        }
        updates.positions = positions.map((p: { ticker: string; weight: number }) => ({
            ticker: p.ticker.toUpperCase().trim(),
            weight: Math.round(p.weight * 100) / 100,
        }));
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { autoRefreshToken: false, persistSession: false },
        }
    );

    const { data, error } = await userClient
        .from('user_portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ watchlist: data });
}

// DELETE /api/user-watchlists - Delete a watchlist
export async function DELETE(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Watchlist ID is required' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { autoRefreshToken: false, persistSession: false },
        }
    );

    const { error } = await userClient
        .from('user_portfolios')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
