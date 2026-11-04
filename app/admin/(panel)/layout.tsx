import { Suspense } from "react";
import { AdminNav, NavShell } from "@/components/admin/admin-nav";
import { ToastProvider } from "@/components/admin/toast";
import { PageSkeleton } from "@/components/admin/ui";
import { adminDb, currentAdmin } from "@/lib/admin/db";
import { PUBLIC_SITE_URL } from "@/lib/admin/site";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Oturum bloklayarak okunur (yönetici değilse içerik hiç akmaz); anında geçiş beklenmez. */
export const instant = false;

/**
 * Oturum kontrolü düzenin en üstünde, bloklayarak yapılır: yönetici değilse yanıt hiç
 * akmadan gerçek bir 307 ile /admin/giris'e yönlendirilir (kök düzende instant = false).
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await adminDb();
  return (
    <ToastProvider>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        İçeriğe geç
      </a>
      <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <Suspense fallback={<NavShell pathname={null} siteUrl={PUBLIC_SITE_URL} />}>
          <SessionNav />
        </Suspense>
        <main id="icerik" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

async function SessionNav() {
  const admin = await currentAdmin();
  let unread = 0;
  if (admin) {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false);
    unread = count ?? 0;
  }
  return <AdminNav email={admin?.email} unread={unread} siteUrl={PUBLIC_SITE_URL} />;
}
