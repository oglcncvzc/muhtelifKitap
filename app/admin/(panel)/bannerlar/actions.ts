"use server";

import { redirect } from "next/navigation";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader, isUuid } from "@/lib/admin/form";

export async function saveBannerAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const id = f.uuid("id");
  const mode = f.oneOf("link_mode", ["book", "url", "none"] as const, "none");
  const book_id = mode === "book" ? f.uuid("book_id", { required: true, label: "Kitap" }) : null;
  const link_url = mode === "url" ? f.link("link_url", { required: true, label: "Bağlantı" }) : null;

  const payload = {
    title_tr: f.text("title_tr", { max: 200 }),
    title_en: f.text("title_en", { max: 200 }),
    subtitle_tr: f.text("subtitle_tr", { max: 400 }),
    subtitle_en: f.text("subtitle_en", { max: 400 }),
    cta_tr: f.text("cta_tr", { max: 60 }),
    cta_en: f.text("cta_en", { max: 60 }),
    book_id,
    link_url,
    image_desktop_url: f.url("image_desktop_url", { required: true, label: "Masaüstü görseli" }),
    image_mobile_url: f.url("image_mobile_url"),
    text_theme: f.oneOf("text_theme", ["light", "dark"] as const, "light"),
    is_active: f.bool("is_active"),
  };
  if (!payload.image_desktop_url && !f.errors.image_desktop_url) f.fail("image_desktop_url", "Masaüstü görseli zorunludur.");
  if (!f.ok()) return fail(INVALID, f.errors);

  if (id) {
    const { data, error } = await supabase.from("banners").update(payload).eq("id", id).select("id");
    if (error) return fail(dbErrorMessage(error));
    if (!data?.length) return fail("Banner bulunamadı; silinmiş olabilir.");
    catalogChanged();
    return ok("Banner kaydedildi.");
  }
  const { data: last } = await supabase.from("banners").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10;
  const { data, error } = await supabase.from("banners").insert({ ...payload, sort_order }).select("id").single();
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  redirect(`/admin/bannerlar/${data.id}?durum=olusturuldu`);
}

export async function deleteBannerAction(id: string, back = true): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { data, error } = await supabase.from("banners").delete().eq("id", id).select("id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Banner bulunamadı; zaten silinmiş olabilir.");
  catalogChanged();
  if (back) redirect("/admin/bannerlar?durum=silindi");
  return ok("Banner silindi.");
}

export async function toggleBannerAction(id: string, active: boolean): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { error } = await supabase.from("banners").update({ is_active: Boolean(active) }).eq("id", id);
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  return ok(active ? "Banner yayına alındı." : "Banner yayından kaldırıldı.");
}
