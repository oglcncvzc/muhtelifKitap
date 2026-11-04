"use server";

import { redirect } from "next/navigation";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb } from "@/lib/admin/db";
import { authErrorMessage } from "@/lib/admin/errors";
import { formReader } from "@/lib/admin/form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { admin, supabase } = await actionDb();
  const f = formReader(fd);
  const current = f.text("current", { required: true, label: "Mevcut şifre", max: 200 });
  const password = f.text("password", { required: true, label: "Yeni şifre", max: 200 });
  const confirm = f.text("confirm", { required: true, label: "Şifre tekrarı", max: 200 });
  if (password && password.length < 8) f.fail("password", "Şifre en az 8 karakter olmalı.");
  if (password && confirm && password !== confirm) f.fail("confirm", "Şifreler eşleşmiyor.");
  if (password && current && password === current) f.fail("password", "Yeni şifre mevcut şifreyle aynı olamaz.");
  if (!f.ok() || !current || !password) return fail(INVALID, f.errors);

  // Mevcut şifreyi doğrula
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: admin.email, password: current });
  if (verifyError) return fail(INVALID, { current: "Mevcut şifre hatalı." });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return fail(authErrorMessage(error));
  return ok("Şifreniz güncellendi.");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/giris?durum=cikis");
}
