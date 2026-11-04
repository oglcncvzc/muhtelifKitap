"use server";

import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader } from "@/lib/admin/form";

export async function saveSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const payload = {
    id: 1,
    company_name: f.text("company_name", { required: true, label: "Şirket / yayınevi adı", max: 200 }),
    featured_book_id: f.uuid("featured_book_id"),
    featured_text_tr: f.text("featured_text_tr", { max: 3000 }),
    featured_text_en: f.text("featured_text_en", { max: 3000 }),
    home_about_tr: f.text("home_about_tr", { max: 5000 }),
    home_about_en: f.text("home_about_en", { max: 5000 }),
    submission_tr: f.text("submission_tr", { max: 5000 }),
    submission_en: f.text("submission_en", { max: 5000 }),
    address: f.text("address", { max: 500 }),
    phone: f.text("phone", { max: 50 }),
    email: f.email("email"),
    map_query: f.text("map_query", { max: 300 }),
    instagram: f.url("instagram"),
    x: f.url("x"),
    facebook: f.url("facebook"),
    youtube: f.url("youtube"),
    linkedin: f.url("linkedin"),
  };
  if (payload.phone && !/^[0-9+()\-\s.]{5,}$/.test(payload.phone)) f.fail("phone", "Geçerli bir telefon numarası girin.");
  if (!f.ok()) return fail(INVALID, f.errors);

  const { error } = await supabase.from("settings").upsert(payload, { onConflict: "id" });
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  return ok("Site ayarları kaydedildi.");
}
