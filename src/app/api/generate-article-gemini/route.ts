import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, checkRateLimit, getClientIP, sanitizeTopic } from '@/lib/security';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-pro-preview-06-05';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are PM Research, an elite investment research analyst focused on identifying alpha-generating opportunities 12-36 months before consensus.

IMPORTANT: You are an educational research tool. You DO NOT provide financial advice. You focus on structural analysis, technology trends, and market cycles.

Your research style:
1. FORWARD-LOOKING: You analyze emerging technologies, inflection points, and structural changes BEFORE they become mainstream narratives.
2. STRUCTURAL NOT SPECULATIVE: Focus on infrastructure, adoption curves, and supply chains, not short-term price targets.
3. TECHNICAL DEPTH: You understand the underlying technology, not just the stock story.
4. CONTRARIAN EDGE: You find opportunities where consensus is wrong or hasn't formed yet.

Your writing style matches examples like analyzing SMR nuclear for AI power demands, quantum computing timeline acceleration, and space infrastructure buildouts.

When generating research, you MUST return valid JSON with this exact structure:
{
  "title": "Compelling research title",
  "summary": "2-3 sentence executive summary",
  "fullContent": "Full markdown article with ## headers, bullet points, and analysis (800-1200 words). Do NOT use bold (**) formatting.",
  "pmScore": 75,
  "category": "Sector Analysis | Risk Assessment | Deep Dive",
  "relatedTickers": ["TICKER1", "TICKER2"],
  "readTime": "5 min read"
}

Rules for pmScore:
- 80-100: Strong thesis, well-supported structural trend, clear drivers
- 60-79: Developing thesis, emerging trend, drivers forming over 12-24 months
- 40-59: Early stage, monitoring for inflection points
- Below 40: Exploratory or high uncertainty`;

export async function POST(request: NextRequest) {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, 10, 60 * 60 * 1000);

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                }
            }
        );
    }

    const auth = await verifyAuth(request);
    if (!auth) {
        return NextResponse.json(
            { error: 'Authentication required. Please log in to access this resource.' },
            { status: 401 }
        );
    }

    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'Gemini API key not configured. Get a free key at https://aistudio.google.com/apikey' },
            { status: 500 }
        );
    }

    try {
        const { topic, category } = await request.json();

        const topicResult = sanitizeTopic(topic);
        if (!topicResult.valid) {
            return NextResponse.json(
                { error: topicResult.error },
                { status: 400 }
            );
        }

        const sanitizedTopic = topicResult.sanitized;

        const userPrompt = `Generate a PM Research deep-dive article on: "${sanitizedTopic}"

Focus on:
- What's the 12-36 month forward thesis?
- What inflection points or catalysts are approaching?
- Who are the key players/beneficiaries (provide ticker symbols)?
- What is consensus missing or getting wrong?
- What's the risk/reward setup?

IMPORTANT COMPLIANCE — THIS IS RESEARCH AND ANALYSIS ONLY, NOT FINANCIAL ADVICE:
- Do NOT make specific price predictions or price targets (e.g., "Stock will hit $100" or "$127 price target").
- Do NOT include short-term technical analysis (MACD, RSI, moving averages, volume patterns, support/resistance levels).
- Do NOT use sections titled "Recommended Action", "Affected Positions", "Position Sizing", "The Trade", or "Alpha Extraction".
- Do NOT recommend buying, selling, trimming, rotating, or any specific portfolio actions.
- Do NOT use language like "we are upgrading to Overweight", "initiating coverage with a Buy", or "adding to our watchlist".
- Use sections like "Research Outlook", "Sector Impact", "Coverage Update", "Structural Analysis", "Key Companies" instead.
- Focus on structural analysis, technology trends, and market dynamics — NOT investment recommendations.
- Write in clear, professional prose. Avoid filler phrases, excessive hedging, or generic AI-style language.

${category ? `Category preference: ${category}` : 'Choose the most appropriate category.'}

Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON, no other text.`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || `Gemini API error: ${response.status}`;
            console.error('Gemini API error:', errorMessage);
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();

        const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            console.error('No content in Gemini response:', JSON.stringify(data));
            return NextResponse.json(
                { error: 'No content generated' },
                { status: 500 }
            );
        }

        // Parse the JSON response - strip markdown fences if present
        const cleaned = textContent.replace(/```json\s*|```\s*/g, '').trim();
        const article = JSON.parse(cleaned);

        // Validate required fields
        const required = ['title', 'summary', 'fullContent', 'pmScore', 'category'];
        for (const field of required) {
            if (!article[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 500 }
                );
            }
        }

        // Normalize
        article.id = `research-${Date.now()}`;
        article.date = new Date().toISOString().split('T')[0];
        article.author = 'PM Research AI';
        article.readTime = article.readTime || '5 min read';
        article.relatedTickers = article.relatedTickers || [];
        article.pmScore = Math.min(100, Math.max(0, Number(article.pmScore)));

        return NextResponse.json({ article });

    } catch (error) {
        console.error('Article generation failed:', error);
        return NextResponse.json(
            { error: error instanceof SyntaxError ? 'Failed to parse AI response as JSON' : 'Failed to generate article' },
            { status: 500 }
        );
    }
}
