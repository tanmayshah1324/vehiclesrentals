import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the key is a proper JWT (anon key starts with "eyJ")
const isValidKey = supabaseAnonKey && supabaseAnonKey.startsWith('eyJ');

// Force disable Supabase to use local JSON server for testing
export const supabase = null;

if (!supabase) {
    if (supabaseAnonKey && !isValidKey) {
        console.warn('[Database] Invalid Supabase anon key format. The anon key should be a JWT starting with "eyJ...". You may have pasted the publishable key from the Dashboard instead. Go to Supabase → Project Settings → API → "anon public" key.');
    }
    console.log('[Database] Supabase not available. Using Local JSON Server fallback.');
} else {
    console.log('[Database] Supabase client initialized successfully.');
}

