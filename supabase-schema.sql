-- ==============================================================================
-- AETHERHUB DATABASE & STORAGE MIGRATION SCRIPT (SAFE & IDEMPOTENT)
-- สคริปต์แบบปลอดภัย สามารถรันซ้ำได้โดยไม่ติด Error 42710
-- ==============================================================================

-- 1. สร้างตารางจัดเก็บไฟล์ (files) หากยังไม่มี
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    public_url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. สร้างตารางสมุดจดด่วน (notes) หากยังไม่มี
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'บันทึกด่วน',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. สร้างตารางข้อความแชตสดแบบเรียลไทม์ (messages) หากยังไม่มี
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#06B6D4',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ตั้งค่า REPLICA IDENTITY FULL (รันซ้ำได้ปลอดภัย 100%)
ALTER TABLE public.files REPLICA IDENTITY FULL;
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 5. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- นโยบาย Files
DROP POLICY IF EXISTS "Public can view files" ON public.files;
CREATE POLICY "Public can view files" ON public.files FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert files" ON public.files;
CREATE POLICY "Public can insert files" ON public.files FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete files" ON public.files;
CREATE POLICY "Public can delete files" ON public.files FOR DELETE USING (true);

-- นโยบาย Notes
DROP POLICY IF EXISTS "Public can view notes" ON public.notes;
CREATE POLICY "Public can view notes" ON public.notes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert notes" ON public.notes;
CREATE POLICY "Public can insert notes" ON public.notes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update notes" ON public.notes;
CREATE POLICY "Public can update notes" ON public.notes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete notes" ON public.notes;
CREATE POLICY "Public can delete notes" ON public.notes FOR DELETE USING (true);

-- นโยบาย Messages (แชตสด)
DROP POLICY IF EXISTS "Public can view messages" ON public.messages;
CREATE POLICY "Public can view messages" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert messages" ON public.messages;
CREATE POLICY "Public can insert messages" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete messages" ON public.messages;
CREATE POLICY "Public can delete messages" ON public.messages FOR DELETE USING (true);

-- 6. ตั้งค่า Storage Bucket `hub-files`
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hub-files', 'hub-files', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to hub-files" ON storage.objects;
CREATE POLICY "Public Access to hub-files" ON storage.objects FOR SELECT USING (bucket_id = 'hub-files');
DROP POLICY IF EXISTS "Public Upload to hub-files" ON storage.objects;
CREATE POLICY "Public Upload to hub-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hub-files');
DROP POLICY IF EXISTS "Public Update in hub-files" ON storage.objects;
CREATE POLICY "Public Update in hub-files" ON storage.objects FOR UPDATE USING (bucket_id = 'hub-files');
DROP POLICY IF EXISTS "Public Delete in hub-files" ON storage.objects;
CREATE POLICY "Public Delete in hub-files" ON storage.objects FOR DELETE USING (bucket_id = 'hub-files');

-- 7. ตรวจสอบและเพิ่มเข้า supabase_realtime เฉพาะตารางที่ยังไม่ได้เพิ่ม (ป้องกัน Error 42710)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
