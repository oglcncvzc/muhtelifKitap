import "server-only";
import { adminDb } from "@/lib/admin/db";
import { TAXONOMIES, type TaxonomyKind, type TaxonomyRow } from "@/lib/admin/taxonomy";

/** Kayıtlar + her kaydın kaç kitapta/bağlantıda kullanıldığı. */
export async function getTaxonomy(kind: TaxonomyKind) {
  const { supabase } = await adminDb();
  const { usage } = TAXONOMIES[kind];
  const [rows, used] = await Promise.all([
    supabase.from(kind).select("*").order("sort_order"),
    supabase.from(usage.table).select(usage.column).not(usage.column, "is", null),
  ]);
  const counts: Record<string, number> = {};
  for (const r of (used.data ?? []) as unknown as Record<string, string>[]) {
    const key = r[usage.column];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return { error: rows.error ?? used.error, items: (rows.data ?? []) as TaxonomyRow[], counts };
}
