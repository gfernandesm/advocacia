import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Cliente server-side com service role key.
// Usar exclusivamente em Server Components, API routes e Server Actions.
// Nunca expor para o browser — a key tem acesso total ao banco.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios"
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
