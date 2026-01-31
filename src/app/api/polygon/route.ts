import { NextRequest, NextResponse } from 'next/server';
import { YTD_BASELINE_DATE, formatDateISO } from '@/lib/dateUtils';

export const dynamic = "force-dynamic";

// Server-side only - never expose to client
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Supported endpoints
type PolygonEndpoint = 'aggs' | 'ticker' | 'quote';

interface AggregateBar {
    c: number;  // close
    h: number;  // high
    l: number;  // low
    o: number;  // open
    v: number;  // volume
    t: number;  // timestamp
    n?: number; // number of trades
    vw?: number; // volume weighted average price
}

interface PolygonAggsResponse {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results?: AggregateBar[];
    status: string;
    request_id: string;
}

interface PolygonTickerResponse {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    currency_name: string;
    cik?: string;
    composite_figi?: string;
    share_class_figi?: string;
}

// Fetch aggregate bars for a ticker
async function fetchAggregates(
    ticker: string,
    from: string,
    to: string,
    multiplier: number = 1,
    timespan: string = 'day'
): Promise<PolygonAggsResponse | null> {
    const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Polygon API error: ${response.status}`);
            return null;
        }

        return response.json();
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error('Polygon API request timed out');
        } else {
            console.error('Polygon API error:', error);
        }
        return null;
    }
}

// Fetch ticker details
async function fetchTickerDetails(ticker: string): Promise<PolygonTickerResponse | null> {
    const url = `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Polygon ticker details error:', error);
        return null;
    }
}

// Get YTD baseline close price (last trading day of previous year)
async function getYTDBaselineClose(ticker: string): Promise<number | null> {
    const baselineDate = new Date(YTD_BASELINE_DATE);
    const nextDay = new Date(baselineDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const from = YTD_BASELINE_DATE;
    const to = formatDateISO(nextDay);

    const data = await fetchAggregates(ticker, from, to);

    if (!data?.results || data.results.length === 0) {
        return null;
    }

    return data.results[0].c;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') as PolygonEndpoint;
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
        return NextResponse.json({ error: 'No ticker provided' }, { status: 400 });
    }

    if (!POLYGON_API_KEY) {
        return NextResponse.json({ error: 'Polygon API key not configured' }, { status: 500 });
    }

    try {
        switch (endpoint) {
            case 'aggs': {
                const from = searchParams.get('from') || YTD_BASELINE_DATE;
                const to = searchParams.get('to') || formatDateISO(new Date());
                const multiplier = parseInt(searchParams.get('multiplier') || '1');
                const timespan = searchParams.get('timespan') || 'day';

                const data = await fetchAggregates(ticker, from, to, multiplier, timespan);

                if (!data) {
                    return NextResponse.json({ error: 'Failed to fetch aggregates' }, { status: 500 });
                }

                return NextResponse.json(data);
            }

            case 'ticker': {
                const data = await fetchTickerDetails(ticker);

                if (!data) {
                    return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
                }

                return NextResponse.json(data);
            }

            case 'quote': {
                // Get the YTD baseline close price
                const baselineClose = await getYTDBaselineClose(ticker);

                if (baselineClose === null) {
                    return NextResponse.json({ error: 'Could not fetch baseline price' }, { status: 500 });
                }

                return NextResponse.json({
                    ticker,
                    baselineClose,
                    baselineDate: YTD_BASELINE_DATE,
                });
            }

            default:
                return NextResponse.json({
                    error: 'Invalid endpoint. Use: aggs, ticker, or quote'
                }, { status: 400 });
        }
    } catch (error) {
        console.error(`Polygon API error for ${ticker}:`, error);
        return NextResponse.json({ error: 'Failed to fetch from Polygon' }, { status: 500 });
    }
}
