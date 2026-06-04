import { createClient } from '@supabase/supabase-js';

// ─── HARDCODED for production deployment ───────────────────────
// The Cloudflare Pages build does not receive .env files
// (they are gitignored). These values work until Cloudflare
// environment variables are configured in the dashboard.
// ───────────────────────────────────────────────────────────────
const supabaseUrl = 'https://cxmwfmbmkjsnhtarktfe.supabase.co';
const supabaseAnonKey = 'sb_publishable_a9Lw6EUiQ0PmUqX0ByldaA_greU7fNn';

// ─── Original env‑var logic (restore when Cloudflare env vars are set) ───
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// ──────────────────────────────────────────────────────────────────────────

const isPlaceholder = (v: string) =>
  !v || v.startsWith('your-') || v === 'YOUR_SUPABASE_URL' || v === 'YOUR_SUPABASE_ANON_KEY';

const hasConfig = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey));

if (!hasConfig) {
  console.warn(
    'Supabase not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.'
  );
}

export const supabase = hasConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
