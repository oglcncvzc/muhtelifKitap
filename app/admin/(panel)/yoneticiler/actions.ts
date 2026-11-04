"use server";

import { refresh } from "next/cache";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb } from "@/lib/admin/db";
import { authErrorMessage, dbErrorMessage } from "@/lib/admin/errors";
import { formReader, isUuid } from "@/lib/admin/form";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const NO_SERVICE_KEY =
  "Yönetici eklemek/silmek için sunucuda SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı olmalı. Lütfen site yöneticinize başvurun.";

function serviceClient() {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

/** Yeni yönetici: e-posta doğrulanmış bir kullanıcı oluşturur ve admins tablosuna ekler. */
export async function addAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const email = f.email("email", { required: true, label: "E-posta" });
  const password = f.text("password", { required: true, label: "Geçici şifre", max: 200 });
  if (password && password.length < 8) f.fail("password", "Şifre en az 8 karakter olmalı.");
  if (!f.ok() || !email || !password) return fail(INVALID, f.errors);

  const service = serviceClient();
  if (!service) return fail(NO_SERVICE_KEY);

  const { data: existing } = await supabase.from("admins").select("user_id").eq("email", email).limit(1);
  if (existing?.length) return fail(INVALID, { email: "Bu e-posta zaten yönetici." });

  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) return fail(authErrorMessage(error), { email: authErrorMessage(error) });

  const { error: insertError } = await supabase.from("admins").insert({ user_id: data.user.id, email });
  if (insertError) {
    await service.auth.admin.deleteUser(data.user.id); // geri al
    return fail(dbErrorMessage(insertError));
  }
  refresh();
  return ok(`${email} yönetici olarak eklendi. Geçici şifreyi kendisine güvenli bir yoldan iletin.`);
}

/** Yöneticiyi kaldırır: admins kaydını ve kullanıcı hesabını siler. Kendinizi silemezsiniz. */
export async function removeAdminAction(userId: string): Promise<ActionState> {
  const { admin, supabase } = await actionDb();
  if (!isUuid(userId)) return fail("Geçersiz kayıt.");
  if (userId === admin.id) return fail("Kendi yönetici hesabınızı silemezsiniz.");

  const service = serviceClient();
  if (!service) return fail(NO_SERVICE_KEY);

  const { data, error } = await supabase.from("admins").delete().eq("user_id", userId).select("user_id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Yönetici bulunamadı; zaten silinmiş olabilir.");

  const { error: authError } = await service.auth.admin.deleteUser(userId);
  refresh();
  if (authError) {
    console.error("[admin] Kullanıcı hesabı silinemedi:", authError.message);
    return fail("Yönetici yetkisi kaldırıldı ancak kullanıcı hesabı silinemedi. Hesap artık panele erişemez.");
  }
  return ok("Yönetici kaldırıldı.");
}
