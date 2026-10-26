-- ==============================================================================
-- AETHERHUB DATABASE & STORAGE MIGRATION SCRIPT
-- Run this in the Supabase SQL Editor (SQL Editor -> New query -> Paste & Run)
-- ==============================================================================

-- 1. Create the `files` table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    public_url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on `files`
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- File Policies (Allow public read, upload, and delete for the collaborative hub)
DROP POLICY IF EXISTS "Public can view files" ON public.files;
CREATE POLICY "Public can view files"
ON public.files FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can insert files" ON public.files;
CREATE POLICY "Public can insert files"
ON public.files FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete files" ON public.files;
CREATE POLICY "Public can delete files"
ON public.files FOR DELETE
USING (true);


-- 2. Create the `notes` table for Quick Scratchpad
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Untitled Memo',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on `notes`
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies
DROP POLICY IF EXISTS "Public can view notes" ON public.notes;
CREATE POLICY "Public can view notes"
ON public.notes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can insert notes" ON public.notes;
CREATE POLICY "Public can insert notes"
ON public.notes FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update notes" ON public.notes;
CREATE POLICY "Public can update notes"
ON public.notes FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete notes" ON public.notes;
CREATE POLICY "Public can delete notes"
ON public.notes FOR DELETE
USING (true);


-- 3. Storage Bucket Configuration: `hub-files`
-- Create public bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hub-files',
    'hub-files',
    true,
    52428800, -- 50 MB limit
    NULL      -- Allow any file type
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Security Policies for `hub-files`
DROP POLICY IF EXISTS "Public Access to hub-files" ON storage.objects;
CREATE POLICY "Public Access to hub-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'hub-files');

DROP POLICY IF EXISTS "Public Upload to hub-files" ON storage.objects;
CREATE POLICY "Public Upload to hub-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hub-files');

DROP POLICY IF EXISTS "Public Update in hub-files" ON storage.objects;
CREATE POLICY "Public Update in hub-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hub-files');

DROP POLICY IF EXISTS "Public Delete in hub-files" ON storage.objects;
CREATE POLICY "Public Delete in hub-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'hub-files');

-- Enable Realtime (Optional / Recommended for instant synchronizations)
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
