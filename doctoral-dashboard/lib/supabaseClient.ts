import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Safe client creation even if env vars are missing (UI will show helpful errors)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
