import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the key is a proper JWT (anon key starts with "eyJ") or a new publishable key ("sb_publishable_")
const isValidKey = supabaseAnonKey && (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_'));

// Initialize Supabase if keys exist and are valid
export const supabase = (supabaseUrl && isValidKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;

if (!supabase) {
    if (supabaseAnonKey && !isValidKey) {
        console.warn('[Database] Invalid Supabase anon key format. The anon key should be a JWT starting with "eyJ...".');
    }
    console.log('[Database] Supabase not available. Using Local JSON Server fallback.');
} else {
    console.log('[Database] Supabase client initialized successfully.');
}
