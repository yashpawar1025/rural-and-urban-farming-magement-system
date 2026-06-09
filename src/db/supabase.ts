
import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(rawSupabaseUrl && rawSupabaseAnonKey);

const supabaseUrl = isSupabaseConfigured
    ? rawSupabaseUrl
    : 'http://127.0.0.1:54321';

const supabaseAnonKey = isSupabaseConfigured
    ? rawSupabaseAnonKey
    : 'public-anon-key';

if (!isSupabaseConfigured) {
    console.warn(
        'Supabase env vars are missing. Running in demo mode with local fallback client.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: isSupabaseConfigured,
        autoRefreshToken: isSupabaseConfigured,
        detectSessionInUrl: isSupabaseConfigured,
    },
});
            