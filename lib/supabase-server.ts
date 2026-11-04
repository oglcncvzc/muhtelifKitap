import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase";

/**
 * Oturumlu istemci (yönetim paneli). Kullanıcının çerezindeki oturumla çalışır;
 * yazma yetkisini RLS'teki is_admin() belirler.
 * Çerez okuduğu için yalnızca <Suspense> içinde ya da Server Action'larda çağrılmalı.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Server Component içinden çağrıldığında çerez yazılamaz; oturum proxy.ts'te yenilenir.
        }
      },
    },
  });
}

/**
 * Service role istemcisi — RLS'i atlar. YALNIZCA requireAdmin() ile yetki
 * doğrulandıktan sonra, kullanıcı yönetimi gibi auth.admin işlemleri için.
 */
export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil");
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
