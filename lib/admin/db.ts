import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { refresh, updateTag } from "next/cache";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** İstek başına bir kez çalışan yönetici kontrolü (sayfalar ve düzen için). */
export const currentAdmin = cache(async () => {
  // Oturum isteğe özgüdür; Supabase'in token süresi kontrolündeki Date.now() prerender'a girmesin.
  await connection();
  return getAdmin();
});

/**
 * Yönetici doğrulaması + oturumlu Supabase istemcisi (sayfalar için, istek başına önbellekli).
 * Çerez okuduğu için yalnızca <Suspense> içinde çağrılmalı.
 */
export const adminDb = cache(async () => {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/giris");
  const supabase = await createSupabaseServerClient();
  return { admin, supabase };
});

/** Server Action'lar için: her çağrıda yetkiyi yeniden doğrular. */
export async function actionDb() {
  const admin = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  return { admin, supabase };
}

/** Herkese açık site önbelleğini ve paneli anında yeniler. Yalnızca Server Action içinde. */
export function catalogChanged() {
  updateTag(CATALOG_TAG);
  refresh();
}
