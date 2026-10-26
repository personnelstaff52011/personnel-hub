import { createClient } from '@supabase/supabase-js';

// Fallback to project credentials if environment variables are not set on Vercel
const DEFAULT_SUPABASE_URL = 'https://qijzxlewpepsgmfmhpcx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpanp4bGV3cGVwc2dtZm1ocGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5OTYxMTgsImV4cCI6MjEwODU3MjExOH0.oVFYdDuFJCTBhed-PC-JYDH4iYaBjrLnE3a18QvpYD8';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
