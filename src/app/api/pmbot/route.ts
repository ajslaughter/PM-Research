import { NextRequest, NextResponse } from 'next/server';
import { sanitizeMessage, verifyOrigin } from '@/lib/security';

// Sanitize API key
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY ?? '').trim().replace(/[\r\n]/g, '');

// Allowed hosts for origin verification
const ALLOWED_HOSTS = [
    'pm-research.vercel.app',
    'localhost:3000',
    '127.0.0.1:3000',
];

const SYSTEM_PROMPT = `You are PM Bot, the AI research assistant for PM Research. You answer questions about PM Research's model portfolios, sector analysis, and research methodology.

You have knowledge of six model portfolios:

PM RESEARCH PORTFOLIO (equal weight ~11.11% each):
NVDA (AI Hardware), MSFT (Cloud/AI), AAPL (Consumer Tech), GOOGL (Search/AI), AMZN (E-Commerce), META (Social/AI), TSLA (Auto/Robotics), BTC-USD (Digital Assets), AVGO (Semiconductors)

INNOVATION PORTFOLIO (equal weight 20% each):
RKLB (Space Infrastructure), SMCI (AI Hardware), VRT (Power Infrastructure), AVGO (Semiconductors), IONQ (Quantum Computing)

ROBOTICS PORTFOLIO (equal weight ~33.33% each):
ISRG (Surgical Robotics), FANUY (Factory Automation), PATH (Enterprise Automation)

AI INFRASTRUCTURE PORTFOLIO (equal weight 20% each):
IREN (Data Center Mining), CORZ (Bitcoin Mining/HPC), CRWV (AI Cloud Infrastructure), APLD (Applied Digital - AI Compute), NBIS (Nebius - AI Infrastructure)

ENERGY RENAISSANCE PORTFOLIO (equal weight 25% each):
CEG (Constellation Energy - Nuclear Fleet), OKLO (Small Modular Reactors), VRT (Vertiv - Power Infrastructure), BWXT (BWX Technologies - Nuclear Components)

PHYSICAL AI PORTFOLIO (equal weight 25% each):
ISRG (Surgical Robotics), TER (Teradyne - Collaborative Robotics), RKLB (Rocket Lab - Space Systems), TSLA (Tesla - Optimus Robotics/Auto)

PM Score Methodology:
- 80-100: Strong Thesis — Well-supported structural trend, clear drivers
- 60-79: Developing Thesis — Emerging trend, drivers forming over 12-24 months
- 40-59: Monitoring — Early stage, watching for structural shifts
- Below 40: Exploratory — Limited data, high uncertainty

RULES:
1. You are educational only. Never give specific buy/sell recommendations.
2. Never say "you should buy" or "you should sell" anything.
3. Never make price predictions.
4. If asked for advice, explain you provide research and analysis, not financial advice.
5. Keep responses concise — 2-4 paragraphs max.
6. When discussing holdings, explain the THESIS behind why they're in the portfolio, not whether to trade them.
7. You can discuss sectors, technology trends, competitive landscapes, and structural analysis.
8. Always maintain PM Research's voice: forward-looking, structural, contrarian where warranted.`;

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
