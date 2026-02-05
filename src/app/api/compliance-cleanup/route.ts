import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Compliance cleanup route to update categories, titles, and remove non-compliant language
export async function POST() {
    try {
        // Fetch all articles
        const { data: articles, error: fetchError } = await supabase
            .from('research_notes')
            .select('*');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            return NextResponse.json({ message: 'No articles found', updated: 0 });
        }

        let updatedCount = 0;
        const updates: string[] = [];

        // Category replacements
        const categoryMap: Record<string, string> = {
            'Alpha Signal': 'Emerging Trend',
            'Risk Alert': 'Risk Assessment',
        };

        // Title replacements
        const titleMap: Record<string, string> = {
            'SMR Nuclear: The Silent Power Play Behind AI\'s Energy Crisis': 'SMR Nuclear: The Infrastructure Behind AI\'s Energy Demands',
            'SMR Nuclear: The AI Power Renaissance': 'SMR Nuclear: The Infrastructure Behind AI\'s Energy Demands',
            'Quantum Computing: Timeline Acceleration Is Real': 'Quantum Computing: Error Correction Breakthroughs and What They Mean',
            'Quantum Computing: Timeline Acceleration': 'Quantum Computing: Error Correction Breakthroughs and What They Mean',
            'Mag 7 Concentration Risk: When Does the Trade Get Crowded?': 'Mag 7 Concentration: Index Composition at Historic Levels',
            'Space Infrastructure: The $1T Opportunity Nobody Is Modeling': 'Space Infrastructure: LEO Constellations, Launch Economics, and the Emerging Sector',
        };

        // Non-compliant phrases to replace in summaries and content
        const contentReplacements: Array<{ pattern: RegExp; replacement: string }> = [
            // Summary/content language
            { pattern: /the market is mispricing/gi, replacement: 'this report examines' },
            { pattern: /market is mispricing/gi, replacement: 'structural analysis of' },
            { pattern: /mispricing the timeline/gi, replacement: 'the technology, regulatory landscape, and adoption timeline' },
            { pattern: /mispricing the urgency/gi, replacement: 'structural demand for baseload power' },
            { pattern: /mispricing/gi, replacement: 'structural factors in' },
            { pattern: /picks[- ]and[- ]shovels play/gi, replacement: 'infrastructure exposure' },
            { pattern: /"picks and shovels" play/gi, replacement: 'infrastructure exposure' },
            { pattern: /the "picks and shovels" play\./gi, replacement: 'Infrastructure exposure as' },
            { pattern: /investors are still pricing in/gi, replacement: 'current valuations reflect' },
            { pattern: /pricing in past execution/gi, replacement: 'reflects past execution' },
            { pattern: /investable infrastructure/gi, replacement: 'infrastructure sector' },
            { pattern: /coming for .+?'s margins/gi, replacement: 'competitive dynamics in the sector' },
            { pattern: /sooner than consensus expects/gi, replacement: 'with an evolving timeline for commercial applications' },
            { pattern: /commercial viability sooner than consensus expects/gi, replacement: 'technical implications and evolving timeline for commercial applications' },
            { pattern: /signal a new nuclear supercycle/gi, replacement: 'indicate growing institutional interest in nuclear infrastructure' },
            { pattern: /high-conviction opportunity/gi, replacement: 'structural trend' },
            { pattern: /High Conviction/g, replacement: 'Strong Thesis' },
            { pattern: /Building Thesis/g, replacement: 'Developing Thesis' },
            { pattern: /Speculative/g, replacement: 'Exploratory' },
        ];

        // Update each article
        for (const article of articles) {
            const updateData: Record<string, string | number> = {};
            let hasChanges = false;

            // Update category if needed
            if (article.category && categoryMap[article.category]) {
                updateData.category = categoryMap[article.category];
                updates.push(`Category: "${article.category}" → "${updateData.category}" (${article.title})`);
                hasChanges = true;
            }

            // Update title if needed
            if (article.title && titleMap[article.title]) {
                updateData.title = titleMap[article.title];
                updates.push(`Title: "${article.title}" → "${updateData.title}"`);
                hasChanges = true;
            }

            // Update summary if it contains non-compliant language
            if (article.summary) {
                let newSummary = article.summary;
                for (const { pattern, replacement } of contentReplacements) {
                    if (pattern.test(newSummary)) {
                        newSummary = newSummary.replace(pattern, replacement);
                    }
                }
                if (newSummary !== article.summary) {
                    updateData.summary = newSummary;
                    updates.push(`Summary updated for: ${article.title}`);
                    hasChanges = true;
                }
            }

            // Update full_content if it contains non-compliant language
            if (article.full_content) {
                let newContent = article.full_content;
                for (const { pattern, replacement } of contentReplacements) {
                    if (pattern.test(newContent)) {
                        newContent = newContent.replace(pattern, replacement);
                    }
                }
                if (newContent !== article.full_content) {
                    updateData.full_content = newContent;
                    updates.push(`Content updated for: ${article.title}`);
                    hasChanges = true;
                }
            }

            // Apply updates if there are changes
            if (hasChanges) {
                const { error: updateError } = await supabase
                    .from('research_notes')
                    .update(updateData)
                    .eq('id', article.id);

                if (!updateError) {
                    updatedCount++;
                } else {
                    updates.push(`ERROR updating ${article.title}: ${updateError.message}`);
                }
            }
        }

        return NextResponse.json({
            message: 'Compliance cleanup complete',
            total: articles.length,
            updated: updatedCount,
            changes: updates
        });

    } catch (error) {
        console.error('Compliance cleanup failed:', error);
        return NextResponse.json({ error: 'Compliance cleanup failed' }, { status: 500 });
    }
}
