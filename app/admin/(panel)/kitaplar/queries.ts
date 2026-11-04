import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Author, Category, Imprint, Series, Store } from "@/lib/types";

/** Kitap formundaki seçim listeleri. */
export async function getBookOptions(supabase: SupabaseClient) {
  const [authors, categories, series, imprints, stores] = await Promise.all([
    supabase.from("authors").select("id, name").order("name"),
    supabase.from("categories").select("id, name_tr").order("sort_order"),
    supabase.from("series").select("id, name_tr").order("sort_order"),
    supabase.from("imprints").select("id, name").order("sort_order"),
    supabase.from("stores").select("id, name").order("sort_order"),
  ]);
  const error = [authors, categories, series, imprints, stores].find((r) => r.error)?.error ?? null;
  return {
    error,
    authors: ((authors.data ?? []) as Pick<Author, "id" | "name">[]).map((a) => ({ value: a.id, label: a.name })),
    categories: ((categories.data ?? []) as Pick<Category, "id" | "name_tr">[]).map((c) => ({ value: c.id, label: c.name_tr })),
    series: ((series.data ?? []) as Pick<Series, "id" | "name_tr">[]).map((s) => ({ value: s.id, label: s.name_tr })),
    imprints: ((imprints.data ?? []) as Pick<Imprint, "id" | "name">[]).map((i) => ({ value: i.id, label: i.name })),
    stores: ((stores.data ?? []) as Pick<Store, "id" | "name">[]).map((s) => ({ value: s.id, label: s.name })),
  };
}

export type BookOptions = Omit<Awaited<ReturnType<typeof getBookOptions>>, "error">;
