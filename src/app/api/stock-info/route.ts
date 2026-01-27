import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY || '';
const POLYGON_BASE_URL = 'https://api.polygon.io';

async function getYearEndClose(ticker: string): Promise<number> {
    // Fetch Dec 31, 2025 adjusted close from Polygon (or last trading day of 2025)
    const from = '2025-12-29';
    const to = '2025-12-31';
    const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=desc&limit=5&apiKey=${POLYGON_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        return 0;
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
        return 0;
    }

    // Find the last trading day of 2025 and return its adjusted close
    for (const bar of data.results) {
        const barDate = new Date(bar.t);
        if (barDate.getUTCFullYear() === 2025) {
            return bar.c;
        }
    }

    return 0;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
        return NextResponse.json({ error: 'No ticker provided' }, { status: 400 });
    }

    try {
        // Fetch current price and metadata from Yahoo Finance
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
        }

        const data = await response.json();
        const meta = data.chart?.result?.[0]?.meta;

        if (!meta) {
            return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
        }

        // Get Dec 31, 2025 adjusted close from Polygon for YTD baseline
        let yearlyClose = await getYearEndClose(ticker);
        if (yearlyClose === 0) {
            // Fallback to current price if Polygon fails
            yearlyClose = meta.regularMarketPrice;
        }

        // Determine asset class based on sector/industry
        let assetClass = 'Unknown';
        const longName = (meta.longName || '').toLowerCase();

        if (longName.includes('bitcoin') || longName.includes('crypto') || ticker.includes('USD')) {
            assetClass = 'Digital Assets';
        } else if (longName.includes('semiconductor') || longName.includes('nvidia') || longName.includes('amd')) {
            assetClass = 'AI Hardware';
        } else if (longName.includes('robot') || longName.includes('automation')) {
            assetClass = 'Auto/Robotics';
        } else if (longName.includes('space') || longName.includes('rocket')) {
            assetClass = 'Space';
        } else if (longName.includes('quantum')) {
            assetClass = 'Quantum';
        } else if (longName.includes('data center') || longName.includes('server')) {
            assetClass = 'Data Center';
        }

        return NextResponse.json({
            ticker,
            name: meta.shortName || meta.longName || ticker,
            assetClass,
            sector: 'Unknown',
            yearlyOpen: Math.round(yearlyClose * 100) / 100,
            currentPrice: meta.regularMarketPrice,
            pmScore: 75, // Default PM score for new stocks
            lastUpdated: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        console.error(`Error fetching info for ${ticker}:`, error);
        return NextResponse.json({ error: 'Failed to fetch stock info' }, { status: 500 });
    }
}
