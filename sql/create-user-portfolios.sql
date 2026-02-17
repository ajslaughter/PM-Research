-- User watchlists table for customizable watchlist feature
-- Each user can create multiple watchlists with their own stock selections

CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    positions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);

-- Row-Level Security: users can only access their own watchlists
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own watchlists
CREATE POLICY "Users can read own portfolios"
    ON user_portfolios FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own watchlists
CREATE POLICY "Users can insert own portfolios"
    ON user_portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own watchlists
CREATE POLICY "Users can update own portfolios"
    ON user_portfolios FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own watchlists
CREATE POLICY "Users can delete own portfolios"
    ON user_portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_portfolios_updated_at
    BEFORE UPDATE ON user_portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
