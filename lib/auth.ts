import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AdminUser = { id: string; email: string };

/** Oturumdaki kullanıcı yönetici mi? Değilse null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return { id: user.id, email: user.email ?? "" };
}

/** Yönetici değilse giriş sayfasına yönlendirir. Server Action'ların başında da çağrılmalı. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/giris");
  return admin;
}
