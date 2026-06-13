import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// PUBLIC_-переменные Astro инлайнит в клиентский бандл на этапе сборки.
// anon-ключ публичный — данные защищены RLS на стороне Supabase.
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// null, если переменные не заданы — компоненты должны это учитывать и не падать.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
