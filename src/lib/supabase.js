import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Jalankan query; kalau error -> alert & hentikan. Kalau sukses -> kembalikan data.
export async function run(query) {
  const { data, error } = await query;
  if (error) {
    alert(error.message);
    throw error;
  }
  return data;
}
