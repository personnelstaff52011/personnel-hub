-- ==============================================================================
-- AETHERHUB DATABASE & STORAGE MIGRATION SCRIPT
-- สคริปต์สร้างฐานข้อมูลและระบบจัดเก็บไฟล์ AetherHub สำหรับ Supabase SQL Editor
-- ==============================================================================

-- 1. สร้างตารางจัดเก็บไฟล์ (files)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    public_url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิดใช้งาน Row Level Security (RLS) สำหรับตาราง files
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

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


-- 2. สร้างตารางสมุดจดด่วน (notes)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'บันทึกด่วน',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

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


-- 3. สร้างตารางข้อความแชตสดแบบเรียลไทม์ (messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#06B6D4',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view messages" ON public.messages;
CREATE POLICY "Public can view messages"
ON public.messages FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can insert messages" ON public.messages;
CREATE POLICY "Public can insert messages"
ON public.messages FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete messages" ON public.messages;
CREATE POLICY "Public can delete messages"
ON public.messages FOR DELETE
USING (true);


-- 4. ตั้งค่า Storage Bucket: `hub-files` สำหรับจัดเก็บไฟล์
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hub-files',
    'hub-files',
    true,
    52428800, -- ขีดจำกัด 50 MB
    NULL      -- รองรับไฟล์ทุกประเภท
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- นโยบายความปลอดภัยของ Storage Bucket `hub-files`
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

-- เปิด Realtime Synchronization สำหรับทุกตาราง
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
