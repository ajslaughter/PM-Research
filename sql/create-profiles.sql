-- Profiles table: stores user tier, username, and metadata
-- Auto-creates a "free" tier profile when a new user signs up via Supabase Auth

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (username, etc.)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger: auto-create a free profile on signup
-- Reads username from user_metadata if provided during signUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, tier)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
