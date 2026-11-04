import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBookChoices(supabase: SupabaseClient) {
  const { data } = await supabase.from("books").select("id, title, is_published").order("sort_order").order("title");
  return ((data ?? []) as { id: string; title: string; is_published: boolean }[]).map((b) => ({
    value: b.id,
    label: b.is_published ? b.title : `${b.title} (taslak)`,
  }));
}
