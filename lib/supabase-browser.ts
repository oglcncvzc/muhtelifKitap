"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Tarayıcı istemcisi (yönetim paneli): Storage'a dosya yükleme ve giriş için. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
