import { NextRequest, NextResponse } from 'next/server';
import { sanitizeMessage, verifyOrigin } from '@/lib/security';
import { defaultWatchlists, researchNotes } from '@/lib/watchlists';
import { stockDatabase } from '@/data/stockDatabase';

// Sanitize API key
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY ?? '').trim().replace(/[\r\n]/g, '');

// Allowed hosts for origin verification
const ALLOWED_HOSTS = [
    'pm-research.vercel.app',
    'localhost:3000',
    '127.0.0.1:3000',
];

/**
 * Dynamically builds the PM Bot system prompt from the current watchlist
 * and research data. This ensures the bot always reflects the latest
 * watchlists, holdings, and research notes without manual updates.
 */
function buildSystemPrompt(): string {
    // Build watchlist descriptions from the live data
    const watchlistDescriptions = defaultWatchlists.map((watchlist) => {
        const positionList = watchlist.positions.map((pos) => {
            const stock = stockDatabase[pos.ticker];
            const label = stock ? `${stock.name} - ${stock.sector}` : pos.ticker;
            const thesisNote = pos.thesis ? ` | ${pos.thesis}` : '';
            return `${pos.ticker} (${label}${thesisNote}) — ${pos.weight}%`;
        });
        return `${watchlist.name.toUpperCase()} — ${watchlist.description}\nCategory: ${watchlist.category}\nPositions:\n${positionList.map((p) => `  • ${p}`).join('\n')}`;
    }).join('\n\n');

    // Build a concise research digest from the latest notes
    const sortedNotes = [...researchNotes].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const researchDigest = sortedNotes.map((note) => {
        const tickers = note.relatedTickers?.length
            ? ` [${note.relatedTickers.join(', ')}]`
            : '';
        return `• ${note.title} (${note.date}, PM Score: ${note.pmScore})${tickers}\n  ${note.summary}`;
    }).join('\n');

    return `You are PM Bot, the AI research assistant for PM Research — an institutional-grade stock research platform. You answer questions about PM Research's website, features, research watchlists, sector analysis, research methodology, and how to navigate the platform.

ABOUT PM RESEARCH:
PM Research delivers institutional-grade research and research-driven watchlists for investors who want to keep their hand on the pulse of innovation and emerging technologies. The platform is currently free to use.

WEBSITE & NAVIGATION:
The site has five main sections accessible from the navigation bar:
1. Home (/) — Landing page introducing PM Research's mission: "Modeling the Future of Capital." Links to Research Watchlists and Research.
2. PM Live (/pm-live) — Real-time market monitoring dashboard (see PM LIVE section below).
3. Watchlists (/watchlist) — Browse all ${defaultWatchlists.length} research watchlists with live prices, YTD returns, position weights, and investment theses.
4. Research (/research) — "The Feed" — filterable research articles categorized as "Sector Analysis" or "Deep Dive," each with a PM Score, read time, and related tickers.
5. PMbot (/pmbot) — This AI research assistant (you). Users can ask about watchlists, sectors, methodology, or anything on the platform.
Additional pages: Legal pages for Terms of Service and Privacy Policy.

PM LIVE — REAL-TIME MARKET DASHBOARD:
PM Live is the platform's real-time market monitoring hub. It includes:
• Market Performance Chart — Live price performance for SPY (S&P 500), QQQ (Nasdaq), DIA (Dow Jones), IWM (Russell 2000), GLD (Gold), and IBIT (Bitcoin). Switchable timeframes: 1D, 5D, 1M, YTD, 1Y.
• Market Map — Interactive sector heatmap with filters for S&P 500, Dow 30, Nasdaq 100, ETFs, Crypto, Futures, World markets, and Themes. Hover to see ticker, name, industry, weight, price, and percent change.
• Live Ticker Tape — Scrolling banner of 55+ symbols with real-time prices showing gainers and losers.
• Live Feed — Market updates, analyst morning reports, earnings alerts, scorecards, and weekly summaries from PM Research's automated reporting system.
• AI Market Agents (tabs within PM Live):
  - Options Flow Agent — Real-time options analytics for any ticker (SPY, QQQ, TSLA, NVDA, AAPL, AMD, META, AMZN, etc.). Shows total volume, put/call ratios, sentiment, notable trades with strike/expiry/premium details, and max pain levels.
  - Macro Agent — Macroeconomic dashboard with indices, Treasury yields, VIX/volatility, commodities, currencies, and crypto. Includes a yield curve chart, economic calendar with event impact ratings, and a risk gauge.
  - IPO Calendar Agent — Tracks upcoming IPOs, this week's IPOs, recent offerings, SPACs, lock-up expirations, and newly filed S-1s.
  - Research Agent — On-demand deep research on any topic. Three depth levels: Quick (3-5 sources), Standard (10+ sources), and Deep (20+ sources).
• Market Alerts — Users can sign up with a phone number to receive live market alerts via SMS/iMessage (iPhone only, manually approved) including open, hourly, and close reports.

RESEARCH WATCHLISTS (${defaultWatchlists.length} total):
These are research-driven watchlists — curated groups of stocks we have deeply researched and are actively tracking because we believe they sit at the forefront of innovation. Inclusion on a watchlist indicates active research coverage, not a recommendation to purchase.

${watchlistDescriptions}

RECENT RESEARCH NOTES:
${researchDigest}

PM SCORE METHODOLOGY:
PM Score is a proprietary conviction ranking from 0-100 that combines momentum, fundamentals, and structural signals:
- 80-100: Strong Thesis — Well-supported structural trend, clear drivers
- 60-79: Developing Thesis — Emerging trend, drivers forming over 12-24 months
- 40-59: Monitoring — Early stage, watching for structural shifts
- Below 40: Exploratory — Limited data, high uncertainty

MARKET DATA:
Live prices are sourced from Yahoo Finance (stocks) and CoinGecko (crypto). Prices update every 30 seconds when the market is open and every 5 minutes when closed. YTD returns are calculated from December 31, 2025 closing prices as the baseline.

PLATFORM FEATURES SUMMARY:
• Currently free to use — all research and watchlists accessible.
• ${defaultWatchlists.length} Research Watchlists with live prices, YTD tracking, and position theses.
• Research Hub ("The Feed") with PM-scored articles in Sector Analysis and Deep Dive categories.
• PM Live real-time dashboard with charts, heatmaps, ticker tape, AI agents (Options Flow, Macro, IPO, Research), live feed, and market alerts.
• PM Bot (you) — AI research assistant for platform questions and investment thesis discussions.
• Admin-powered article generation using AI for automated research reports.

RULES:
1. You are educational only. Never give specific buy/sell recommendations.
2. Never say "you should buy" or "you should sell" anything.
3. Never make price predictions.
4. If asked for advice, explain you provide research and analysis, not financial advice.
5. Keep responses concise — 2-4 paragraphs max.
6. When discussing holdings, explain the THESIS behind why they're on the watchlist, not whether to trade them.
7. You can discuss sectors, technology trends, competitive landscapes, and structural analysis.
8. Always maintain PM Research's voice: forward-looking, structural, contrarian where warranted.
9. When users ask about site features or navigation, help them find what they need — point them to the right page or feature.
10. If asked about pricing or cost, say that PM Research is currently free to use but pricing may change in the future.`;
}

// Build once at module load — automatically reflects any watchlist/research changes on redeploy
const SYSTEM_PROMPT = buildSystemPrompt();

// Rate limiting - in-memory storage
// WARNING: In-memory rate limiting is unreliable in serverless environments (Vercel/Netlify).
// Each function invocation may get a fresh instance, resetting counters.
// For production reliability, migrate to an external store (e.g., Vercel KV / Upstash Redis).
interface RateLimitEntry {
    hourlyCount: number;
    hourlyResetTime: number;
    dailyCount: number;
    dailyResetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let globalDailyCount = 0;
let globalDailyResetTime = Date.now() + 24 * 60 * 60 * 1000;
let requestCounter = 0;

const HOURLY_LIMIT = 15;
const DAILY_LIMIT = 50;
const GLOBAL_DAILY_LIMIT = 1200;

function getClientIP(request: NextRequest): string {
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

function cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, ip) => {
        if (now > entry.dailyResetTime) {
            keysToDelete.push(ip);
        }
    });
    keysToDelete.forEach((ip) => rateLimitMap.delete(ip));
}

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
    const now = Date.now();

    // Check global daily limit
    if (now > globalDailyResetTime) {
        globalDailyCount = 0;
        globalDailyResetTime = now + 24 * 60 * 60 * 1000;
    }

    if (globalDailyCount >= GLOBAL_DAILY_LIMIT) {
        return { allowed: false, message: 'PM Bot is at capacity. Try again tomorrow.' };
    }

    // Get or create rate limit entry for this IP
    let entry = rateLimitMap.get(ip);
    if (!entry) {
        entry = {
            hourlyCount: 0,
            hourlyResetTime: now + 60 * 60 * 1000,
            dailyCount: 0,
            dailyResetTime: now + 24 * 60 * 60 * 1000,
        };
        rateLimitMap.set(ip, entry);
    }

    // Reset hourly if needed
    if (now > entry.hourlyResetTime) {
        entry.hourlyCount = 0;
        entry.hourlyResetTime = now + 60 * 60 * 1000;
    }

    // Reset daily if needed
    if (now > entry.dailyResetTime) {
        entry.dailyCount = 0;
        entry.dailyResetTime = now + 24 * 60 * 60 * 1000;
    }

    // Check limits
    if (entry.hourlyCount >= HOURLY_LIMIT) {
        return { allowed: false, message: 'Rate limit exceeded. Try again later.' };
    }

    if (entry.dailyCount >= DAILY_LIMIT) {
        return { allowed: false, message: 'Daily limit exceeded. Try again tomorrow.' };
    }

    // Increment counters
    entry.hourlyCount++;
    entry.dailyCount++;
    globalDailyCount++;

    // Cleanup every 100 requests
    requestCounter++;
    if (requestCounter % 100 === 0) {
        cleanupExpiredEntries();
    }

    return { allowed: true };
}

export async function POST(request: NextRequest) {
    // Security: Verify request origin
    if (!verifyOrigin(request, ALLOWED_HOSTS)) {
        return NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
        );
    }

    // Check rate limit first (before API key check)
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: rateLimitResult.message },
            { status: 429 }
        );
    }

    if (!ANTHROPIC_API_KEY) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    try {
        const { message, history } = await request.json();

        // Security: Input sanitization
        const messageResult = sanitizeMessage(message);
        if (!messageResult.valid) {
            return NextResponse.json(
                { error: messageResult.error },
                { status: 400 }
            );
        }
        const sanitizedMessage = messageResult.sanitized;

        // Build messages array for Claude API
        // Convert from Gemini format (role: "model") to Claude format (role: "assistant")
        const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

        // Add history if provided
        if (history && Array.isArray(history)) {
            for (const msg of history) {
                const role = msg.role === 'model' ? 'assistant' : 'user';
                const content = msg.parts?.[0]?.text || '';
                if (content) {
                    messages.push({ role, content });
                }
            }
        }

        // Add current user message (sanitized)
        messages.push({ role: 'user', content: sanitizedMessage });

        // Call Claude API with streaming
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                system: SYSTEM_PROMPT,
                messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to generate response' },
                { status: response.status }
            );
        }

        // Create a TransformStream to process the SSE response
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                let buffer = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });

                        // Process complete SSE events
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') continue;

                                try {
                                    const parsed = JSON.parse(data);
                                    // Claude streaming format: content_block_delta events contain the text
                                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                                        controller.enqueue(encoder.encode(parsed.delta.text));
                                    }
                                } catch {
                                    // Skip malformed JSON
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Error in pmbot route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
