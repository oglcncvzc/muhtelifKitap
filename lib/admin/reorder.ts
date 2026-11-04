"use server";

import { fail, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { isUuid } from "@/lib/admin/form";

const SORTABLE = ["books", "authors", "banners", "categories", "series", "imprints", "stores"] as const;
type SortableTable = (typeof SORTABLE)[number];

/**
 * Sıralamayı kaydeder: verilen kimlik listesi sırasıyla sort_order = 10, 20, 30…
 * Yalnızca değeri değişen satırlar güncellenir.
 */
export async function reorderAction(table: SortableTable, ids: string[]): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!SORTABLE.includes(table)) return fail("Geçersiz tablo.");
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 5000 || !ids.every(isUuid) || new Set(ids).size !== ids.length) {
    return fail("Geçersiz sıralama verisi.");
  }

  const { data, error } = await supabase.from(table).select("id, sort_order").in("id", ids);
  if (error) return fail(dbErrorMessage(error));
  const current = new Map((data as { id: string; sort_order: number }[]).map((r) => [r.id, r.sort_order]));

  const changes = ids
    .map((id, i) => ({ id, sort_order: (i + 1) * 10 }))
    .filter((r) => current.has(r.id) && current.get(r.id) !== r.sort_order);

  for (let i = 0; i < changes.length; i += 20) {
    const results = await Promise.all(
      changes.slice(i, i + 20).map((r) => supabase.from(table).update({ sort_order: r.sort_order }).eq("id", r.id)),
    );
    const err = results.find((x) => x.error)?.error;
    if (err) return fail(dbErrorMessage(err));
  }

  catalogChanged();
  return ok("Sıralama kaydedildi.");
}
