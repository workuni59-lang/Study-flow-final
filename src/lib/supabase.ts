import { createClient } from '@supabase/supabase-js';

// Prefer env vars (works in dev via .env); fall back to hardcoded values
// for Cloudflare Pages deployment (which doesn't receive .env files).
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const HARDCODED_URL = 'https://cxmwfmbmkjsnhtarktfe.supabase.co';
const HARDCODED_KEY = 'sb_publishable_a9Lw6EUiQ0PmUqX0ByldaA_greU7fNn';

const isPlaceholder = (v: string) =>
  !v || v.startsWith('your-') || v === 'YOUR_SUPABASE_URL' || v === 'YOUR_SUPABASE_ANON_KEY';

const supabaseUrl = envUrl && !isPlaceholder(envUrl) ? envUrl : HARDCODED_URL;
const supabaseAnonKey = envKey && !isPlaceholder(envKey) ? envKey : HARDCODED_KEY;

if (envUrl && envUrl !== HARDCODED_URL) {
  // Using env var — clean
} else {
  // Warn when hardcoded fallback is active
  console.warn(
    'Supabase: using hardcoded anon key (set VITE_SUPABASE_ANON_KEY in .env to remove from source)'
  );
}

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey));

export const supabase = hasConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
