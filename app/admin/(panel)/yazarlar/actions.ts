"use server";

import { redirect } from "next/navigation";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader, isUuid } from "@/lib/admin/form";

export async function saveAuthorAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const id = f.uuid("id");
  const name = f.text("name", { required: true, label: "Ad soyad", max: 200 });
  const payload = {
    name,
    slug: f.slug("slug", name),
    photo_url: f.url("photo_url"),
    bio_tr: f.text("bio_tr", { max: 20000 }),
    bio_en: f.text("bio_en", { max: 20000 }),
    website: f.url("website"),
    instagram: f.url("instagram"),
    x: f.url("x"),
    facebook: f.url("facebook"),
    featured: f.bool("featured"),
  };
  if (!f.ok() || !name || !payload.slug) return fail(INVALID, f.errors);

  let dup = supabase.from("authors").select("id").eq("slug", payload.slug).limit(1);
  if (id) dup = dup.neq("id", id);
  const { data: dupRows } = await dup;
  if (dupRows?.length) return fail(INVALID, { slug: "Bu kısa ad başka bir yazarda kullanılıyor." });

  if (id) {
    const { data, error } = await supabase.from("authors").update(payload).eq("id", id).select("id");
    if (error) return fail(dbErrorMessage(error));
    if (!data?.length) return fail("Yazar bulunamadı; silinmiş olabilir.");
    catalogChanged();
    return ok("Yazar kaydedildi.");
  }

  const { data: last } = await supabase.from("authors").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10;
  const { data, error } = await supabase.from("authors").insert({ ...payload, sort_order }).select("id").single();
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  redirect(`/admin/yazarlar/${data.id}?durum=olusturuldu`);
}

export async function deleteAuthorAction(id: string): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { data, error } = await supabase.from("authors").delete().eq("id", id).select("id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Yazar bulunamadı; zaten silinmiş olabilir.");
  catalogChanged();
  redirect("/admin/yazarlar?durum=silindi");
}

export async function toggleFeaturedAuthorAction(id: string, featured: boolean): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { error } = await supabase.from("authors").update({ featured: Boolean(featured) }).eq("id", id);
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  return ok(featured ? "Yazar ana sayfada gösterilecek." : "Yazar ana sayfadan kaldırıldı.");
}
