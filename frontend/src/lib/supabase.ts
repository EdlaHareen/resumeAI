import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

// Safe to call even without env vars — auth calls will return errors instead of crashing
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : createClient("https://placeholder.supabase.co", "placeholder");
