"use server";

import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader } from "@/lib/admin/form";
import { PAGE_LABELS } from "./constants";

/** Var olan sayfayı günceller (yeni sayfa oluşturulmaz; slug sabit listeden). */
export async function savePageAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const slug = f.text("slug", { required: true, max: 40 });
  if (!slug || !(slug in PAGE_LABELS)) return fail("Geçersiz sayfa.");
  const payload = {
    title_tr: f.text("title_tr", { required: true, label: "Türkçe başlık", max: 200 }),
    title_en: f.text("title_en", { required: true, label: "İngilizce başlık", max: 200 }),
    body_tr: f.text("body_tr", { max: 100000 }),
    body_en: f.text("body_en", { max: 100000 }),
  };
  if (!f.ok()) return fail(INVALID, f.errors);
  const { data, error } = await supabase.from("pages").update(payload).eq("slug", slug).select("slug");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Sayfa bulunamadı.");
  catalogChanged();
  return ok("Sayfa kaydedildi.");
}
