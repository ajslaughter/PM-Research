import { NextRequest, NextResponse } from 'next/server';

// Sanitize API key: trim whitespace and remove newlines that could cause Headers errors
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY ?? '').trim().replace(/[\r\n]/g, '');

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
  "title": "Compelling title (5-10 words)",
  "summary": "One-sentence thesis (under 200 chars)",
  "fullContent": "Full markdown article with ## headers, ### subheaders, and * bullet points. Do NOT use bold (**) formatting.",
  "pmScore": 75-98 (higher = more conviction),
  "category": "Alpha Signal" | "Sector Analysis" | "Risk Alert" | "Deep Dive",
  "relatedTickers": ["TICK1", "TICK2"],
  "author": "PM Research Alpha Desk"
}`;

export async function POST(request: NextRequest) {
    // SECURITY CHECK: Verify Request Authenticity
    // TODO: Integrate with Supabase Auth Middleware for robust RBAC.
    // Current Gate: Basic check or Env variable toggle can be added here.
    // For now, we rely on the implementation ensuring this route is protected or internal.

    if (!ANTHROPIC_API_KEY) {
        return NextResponse.json(
            { error: 'Anthropic API key not configured' },
            { status: 500 }
        );
    }

    try {
        const { topic, category } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        const userPrompt = `Generate a PM Research deep-dive article on: "${topic}"

Focus on:
- What's the 12-36 month forward thesis?
- What inflection points or catalysts are approaching?
- Who are the key players/beneficiaries (provide ticker symbols)?
- What is consensus missing or getting wrong?
- What's the risk/reward setup?

IMPORTANT COMPLIANCE:
- Do NOT make specific price predictions or price targets (e.g., "Stock will hit $100" or "$127 price target").
- Do NOT include short-term technical analysis (MACD, RSI, moving averages, volume patterns, support/resistance levels).
- Focus on 12-36 month structural thesis, NOT short-term price action.
- Use language like "potential upside," "undervalued relative to peers," or "favorable risk/reward."
- Include a disclaimer section if the thesis is high-risk.
- Write in clear, professional prose. Avoid filler phrases, excessive hedging, or generic AI-style language.

${category ? `Category preference: ${category}` : 'Choose the most appropriate category.'}

Today's date is ${new Date().toISOString().split('T')[0]}.

Return ONLY valid JSON, no other text.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', errorText);

            // Try to parse error message from Anthropic
            let errorMessage = 'Failed to generate article';
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error?.message) {
                    errorMessage = errorJson.error.message;
                }
            } catch {
                // Use raw text if not JSON
                if (errorText.includes('invalid')) {
                    errorMessage = 'Invalid API key - please check ANTHROPIC_API_KEY in Vercel';
                }
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Parse the JSON response
        let article;
        try {
            // Try to extract JSON from the response (in case there's extra text)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                article = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse article JSON:', content);
            return NextResponse.json(
                { error: 'Failed to parse generated article' },
                { status: 500 }
            );
        }

        // Add the date
        article.date = new Date().toISOString().split('T')[0];

        return NextResponse.json({ article });
    } catch (error) {
        console.error('Error generating article:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
