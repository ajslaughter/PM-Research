-- Security Fix: Replace wide-open RLS policies with proper access controls
-- Run this migration in your Supabase SQL Editor

-- Step 1: Remove the existing "Allow all" policy that permits any operation
DROP POLICY IF EXISTS "Allow all" ON research_notes;
DROP POLICY IF EXISTS "Allow full access" ON research_notes;
DROP POLICY IF EXISTS "Enable all" ON research_notes;

-- Step 2: Create proper RLS policies

-- Public can read articles (SELECT) - needed for /research page
CREATE POLICY "Public can read articles" ON research_notes
  FOR SELECT
  USING (true);

-- Only authenticated users can insert new articles
CREATE POLICY "Authenticated users can insert" ON research_notes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update existing articles
CREATE POLICY "Authenticated users can update" ON research_notes
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete articles
CREATE POLICY "Authenticated users can delete" ON research_notes
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verify RLS is enabled on the table
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated role
GRANT SELECT ON research_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON research_notes TO authenticated;
