import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ResearchNote } from './watchlists';

// Get and sanitize environment variables (remove any whitespace/newlines that could cause Headers errors)
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Sanitize: trim whitespace and remove any newlines/carriage returns
const supabaseUrl = rawSupabaseUrl.trim().replace(/[\r\n]/g, '');
const supabaseAnonKey = rawSupabaseAnonKey.trim().replace(/[\r\n]/g, '');

// Validate URL format
function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Validate that environment variables are properly configured
// - URL must be valid
// - Anon key must be a non-empty string that looks like a JWT (starts with "ey")
const isConfigured =
    isValidUrl(supabaseUrl) &&
    supabaseAnonKey.length > 0 &&
    supabaseAnonKey.startsWith('ey');

// Only log configuration warnings in development
if (!isConfigured && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('Supabase environment variables not configured or invalid. Database operations will be disabled.');
}

// Create Supabase client with valid placeholder if not configured
// The placeholder uses a valid JWT-like format to prevent Headers API errors
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY2Mzk0MDAsImV4cCI6MTk2MjIxNTQwMH0.placeholder';

export const supabase: SupabaseClient = createClient(
    isConfigured ? supabaseUrl : PLACEHOLDER_URL,
    isConfigured ? supabaseAnonKey : PLACEHOLDER_KEY
);

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
    linked_watchlist: string | null;
    created_at: string;
}

// Normalize category from DB to valid app categories
export function normalizeCategory(category: string): ResearchNote['category'] {
    const categoryMap: Record<string, ResearchNote['category']> = {
        'Emerging Trend': 'Deep Dive',
        'Alpha Signal': 'Deep Dive',
    };
    return categoryMap[category] || (category as ResearchNote['category']);
}

// Normalize title to remove non-compliant prefixes
export function normalizeTitle(title: string): string {
    return title
        .replace(/^Alpha Signal:/i, 'Deep Dive:');
}

// Normalize content to remove financial advice language
export function normalizeContent(content: string): string {
    return content
        .replace(/## Alert Summary/g, '## Assessment Summary')
        .replace(/## Affected Positions/g, '## Sector Impact')
        .replace(/## Recommended Action/g, '## Research Outlook')
        .replace(/## Alpha Extraction/g, '## Structural Analysis')
        .replace(/### The Trade/g, '### Key Companies')
        .replace(/### Position Sizing/g, '### Sector Structure')
        .replace(/[Tt]rim .+? exposure,? ?rotate to .+?\./g, 'The sector faces structural headwinds. Further analysis warranted.')
        .replace(/[Ww]e're issuing a risk alert/g, 'This report analyzes risk factors')
        .replace(/[Rr]educing conviction,? ?PM Score lowered to \d+/g, 'PM Score under review as thesis faces structural headwinds')
        .replace(/[Mm]onitoring for further deterioration/g, 'Monitoring for further developments across the sector');
}

// Convert DB format to app format
export function dbToResearchNote(db: DbResearchNote): ResearchNote {
    return {
        id: db.id,
        title: normalizeTitle(db.title),
        summary: db.summary,
        fullContent: normalizeContent(db.full_content),
        date: db.date,
        pmScore: db.pm_score,
        category: normalizeCategory(db.category),
        readTime: `${Math.ceil(db.full_content.split(' ').length / 200)} min`,
        relatedTickers: db.related_tickers || undefined,
        author: db.author || undefined,
        linkedWatchlist: db.linked_watchlist || undefined,
    };
}

// Fetch all research notes
export async function fetchResearchNotes(): Promise<ResearchNote[]> {
    if (!isConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
        }
        return [];
    }

    const { data, error } = await supabase
        .from('research_notes')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching research notes:', error);
        }
        return [];
    }

    return (data || []).map(dbToResearchNote);
}

// Save a new research note
export async function saveResearchNote(note: Omit<ResearchNote, 'id' | 'readTime'>): Promise<ResearchNote | null> {
    if (!isConfigured) {
        throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const dbNote = {
        title: note.title,
        summary: note.summary,
        full_content: note.fullContent,
        date: note.date,
        pm_score: note.pmScore,
        category: note.category,
        related_tickers: note.relatedTickers || null,
        author: note.author || null,
        linked_watchlist: note.linkedWatchlist || null,
    };

    const { data, error } = await supabase
        .from('research_notes')
        .insert(dbNote)
        .select()
        .single();

    if (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error saving research note:', error.message);
        }
        throw new Error(error.message || 'Failed to save to database');
    }

    return dbToResearchNote(data);
}

// Delete a research note
export async function deleteResearchNote(id: string): Promise<boolean> {
    if (!isConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Supabase not configured. Cannot delete research note.');
        }
        return false;
    }

    const { error } = await supabase
        .from('research_notes')
        .delete()
        .eq('id', id);

    if (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error deleting research note:', error);
        }
        return false;
    }

    return true;
}
