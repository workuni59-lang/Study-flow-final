import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
