import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
        return NextResponse.json({ error: 'No ticker provided' }, { status: 400 });
    }

    try {
        // Fetch from Yahoo Finance
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`,
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
        const timestamps = data.chart?.result?.[0]?.timestamp || [];
        const opens = data.chart?.result?.[0]?.indicators?.quote?.[0]?.open || [];
        const closes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];

        if (!meta) {
            return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
        }

        // Find Dec 31, 2025 adjusted close (or closest prior trading day)
        let yearlyOpen = meta.regularMarketPrice;
        const dec2025Start = new Date('2025-12-26T00:00:00Z').getTime() / 1000;
        const dec2025End = new Date('2025-12-31T23:59:59Z').getTime() / 1000;

        for (let i = timestamps.length - 1; i >= 0; i--) {
            if (timestamps[i] >= dec2025Start && timestamps[i] <= dec2025End) {
                // Use the close price for 2025-12-31 baseline
                if (closes[i] && closes[i] > 0) {
                    yearlyOpen = closes[i];
                    break;
                }
            }
        }

        // Determine asset class based on sector/industry
        let assetClass = 'Unknown';
        const longName = (meta.longName || '').toLowerCase();
        const shortName = (meta.shortName || '').toLowerCase();

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
            yearlyOpen: Math.round(yearlyOpen * 100) / 100,
            currentPrice: meta.regularMarketPrice,
            pmScore: 75, // Default PM score for new stocks
            lastUpdated: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        console.error(`Error fetching info for ${ticker}:`, error);
        return NextResponse.json({ error: 'Failed to fetch stock info' }, { status: 500 });
    }
}
