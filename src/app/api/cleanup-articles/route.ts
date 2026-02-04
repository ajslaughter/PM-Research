import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// One-time cleanup route to remove ** bold markdown from all articles
export async function POST() {
    try {
        // Fetch all articles
        const { data: articles, error: fetchError } = await supabase
            .from('research_notes')
            .select('id, full_content');

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            return NextResponse.json({ message: 'No articles found', updated: 0 });
        }

        let updatedCount = 0;

        // Update each article to remove ** formatting
        for (const article of articles) {
            if (article.full_content && article.full_content.includes('**')) {
                const cleanedContent = article.full_content.replace(/\*\*/g, '');

                const { error: updateError } = await supabase
                    .from('research_notes')
                    .update({ full_content: cleanedContent })
                    .eq('id', article.id);

                if (!updateError) {
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({
            message: 'Cleanup complete',
            total: articles.length,
            updated: updatedCount
        });

    } catch (error) {
        console.error('Cleanup failed:', error);
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}
