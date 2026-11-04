"use server";

import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader, isUuid } from "@/lib/admin/form";
import { isTaxonomyKind, TAXONOMIES, type TaxonomyKind } from "@/lib/admin/taxonomy";

/** Tür/dizi/yayınevi/mağaza ekler ya da günceller. Yalnızca yapılandırmadaki sütunlar yazılır. */
export async function saveTaxonomyAction(kind: TaxonomyKind, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isTaxonomyKind(kind)) return fail("Geçersiz tablo.");
  const cfg = TAXONOMIES[kind];
  const f = formReader(fd);
  const id = f.uuid("id");

  const payload: Record<string, string | null> = {};
  for (const field of cfg.fields) {
    const opts = { required: field.required, label: field.label, max: field.max };
    payload[field.name] = field.type === "url" || field.type === "image" ? f.url(field.name, opts) : f.text(field.name, opts);
  }
  payload.slug = f.slug("slug", payload[cfg.nameField]);
  if (!f.ok()) return fail(INVALID, f.errors);

  let dup = supabase.from(kind).select("id").eq("slug", payload.slug!).limit(1);
  if (id) dup = dup.neq("id", id);
  const { data: dupRows } = await dup;
  if (dupRows?.length) return fail(INVALID, { slug: `Bu kısa ad başka bir ${cfg.singular} kaydında kullanılıyor.` });

  if (id) {
    const { data, error } = await supabase.from(kind).update(payload).eq("id", id).select("id");
    if (error) return fail(dbErrorMessage(error));
    if (!data?.length) return fail("Kayıt bulunamadı; silinmiş olabilir.");
    catalogChanged();
    return ok("Kaydedildi.");
  }
  const { data: last } = await supabase.from(kind).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10;
  const { error } = await supabase.from(kind).insert({ ...payload, sort_order });
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  return ok("Eklendi.");
}

export async function deleteTaxonomyAction(kind: TaxonomyKind, id: string): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isTaxonomyKind(kind) || !isUuid(id)) return fail("Geçersiz kayıt.");
  const { data, error } = await supabase.from(kind).delete().eq("id", id).select("id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Kayıt bulunamadı; zaten silinmiş olabilir.");
  catalogChanged();
  return ok("Silindi.");
}
