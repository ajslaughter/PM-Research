import { createClient } from '@supabase/supabase-js';
import { ResearchNote } from './portfolios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbResearchNote {
    id: string;
    title: string;
    summary: string;
    full_content: string;
    date: string;
    pm_score: number;
    category: string;
    related_tickers: string[] | null;
    author: string | null;
    created_at: string;
}

// Convert DB format to app format
export function dbToResearchNote(db: DbResearchNote): ResearchNote {
    return {
        id: db.id,
        title: db.title,
        summary: db.summary,
        fullContent: db.full_content,
        date: db.date,
        pmScore: db.pm_score,
        category: db.category as ResearchNote['category'],
        readTime: `${Math.ceil(db.full_content.split(' ').length / 200)} min`,
        relatedTickers: db.related_tickers || undefined,
        author: db.author || undefined,
    };
}

// Fetch all research notes
export async function fetchResearchNotes(): Promise<ResearchNote[]> {
    const { data, error } = await supabase
        .from('research_notes')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching research notes:', error);
        return [];
    }

    return (data || []).map(dbToResearchNote);
}

// Save a new research note
export async function saveResearchNote(note: Omit<ResearchNote, 'id' | 'readTime'>): Promise<ResearchNote | null> {
    const dbNote = {
        title: note.title,
        summary: note.summary,
        full_content: note.fullContent,
        date: note.date,
        pm_score: note.pmScore,
        category: note.category,
        related_tickers: note.relatedTickers || null,
        author: note.author || null,
    };

    const { data, error } = await supabase
        .from('research_notes')
        .insert(dbNote)
        .select()
        .single();

    if (error) {
        console.error('Error saving research note:', error.message, error.details, error.hint);
        throw new Error(error.message || 'Failed to save to database');
    }

    return dbToResearchNote(data);
}

// Delete a research note
export async function deleteResearchNote(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('research_notes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting research note:', error);
        return false;
    }

    return true;
}
