"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { fail, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { isUuid } from "@/lib/admin/form";

export async function setMessageReadAction(id: string, read: boolean, silent = false): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { error } = await supabase.from("contact_messages").update({ is_read: Boolean(read) }).eq("id", id);
  if (error) return fail(dbErrorMessage(error));
  refresh();
  return silent ? ok("") : ok(read ? "Okundu olarak işaretlendi." : "Okunmadı olarak işaretlendi.");
}

export async function deleteMessageAction(id: string, backToList = false): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { data, error } = await supabase.from("contact_messages").delete().eq("id", id).select("id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Mesaj bulunamadı; zaten silinmiş olabilir.");
  if (backToList) redirect("/admin/mesajlar?durum=silindi");
  refresh();
  return ok("Mesaj silindi.");
}
