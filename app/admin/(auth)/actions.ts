"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { authErrorMessage } from "@/lib/admin/errors";
import { formReader } from "@/lib/admin/form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const f = formReader(fd);
  const email = f.email("email", { required: true, label: "E-posta" });
  const password = f.text("password", { required: true, label: "Şifre", max: 200 });
  if (!f.ok() || !email || !password) return fail(INVALID, f.errors);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail(authErrorMessage(error));

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError || !isAdmin) {
    await supabase.auth.signOut();
    return fail("Bu hesabın yönetim paneline erişim yetkisi yok.");
  }
  redirect("/admin");
}

const RESET_SENT =
  "Bu e-posta adresi kayıtlıysa şifre yenileme bağlantısı birkaç dakika içinde gönderilecek. Gelen kutunuzu ve istenmeyen klasörünü kontrol edin.";

export async function requestResetAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const f = formReader(fd);
  const email = f.email("email", { required: true, label: "E-posta" });
  if (!f.ok() || !email) return fail(INVALID, f.errors);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = h.get("origin") ?? `${proto}://${host}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/auth/callback?next=/admin/sifre-yenile`,
  });
  // Hesabın varlığını açığa çıkarmamak için her durumda aynı yanıt verilir.
  if (error) console.error("[admin] Şifre sıfırlama e-postası gönderilemedi:", error.code, error.message);
  return ok(RESET_SENT);
}

export async function setNewPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const f = formReader(fd);
  const password = f.text("password", { required: true, label: "Yeni şifre", max: 200 });
  const confirm = f.text("confirm", { required: true, label: "Şifre tekrarı", max: 200 });
  if (password && password.length < 8) f.fail("password", "Şifre en az 8 karakter olmalı.");
  if (password && confirm && password !== confirm) f.fail("confirm", "Şifreler eşleşmiyor.");
  if (!f.ok() || !password) return fail(INVALID, f.errors);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Bağlantının süresi dolmuş ya da oturum bulunamadı. Lütfen yeni bir şifre yenileme bağlantısı isteyin.");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(authErrorMessage(error), error.code === "weak_password" || error.code === "same_password" ? { password: authErrorMessage(error) } : undefined);

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/giris?durum=sifre");
  }
  redirect("/admin?durum=sifre");
}
