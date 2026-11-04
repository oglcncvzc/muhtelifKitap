import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge, Card, formatDate, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { AddAdminForm, RemoveAdminButton } from "./admin-forms";

export const metadata: Metadata = { title: "Yöneticiler" };

export default function AdminsPage() {
  return (
    <>
      <PageHeader title="Yöneticiler" description="Yönetim paneline erişebilen kişiler." />
      <Suspense fallback={<LoadingBlock rows={4} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { admin, supabase } = await adminDb();
  const { data, error } = await supabase.from("admins").select("user_id, email, created_at").order("created_at");
  const rows = (data ?? []) as { user_id: string; email: string; created_at: string }[];
  const serviceReady = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="space-y-6">
      {!serviceReady && (
        <Notice tone="warning" title="Yönetici ekleme kapalı">
          Sunucuda SUPABASE_SERVICE_ROLE_KEY tanımlı değil; yönetici eklemek ve silmek için bu anahtar gereklidir.
        </Notice>
      )}
      <Card title="Mevcut yöneticiler">
        {error ? (
          <Notice tone="error">Yöneticiler yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>
        ) : (
          <ul className="-my-2 divide-y divide-rule">
            {rows.map((r) => (
              <li key={r.user_id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.email} {r.user_id === admin.id && <Badge tone="blue">Siz</Badge>}
                  </p>
                  <p className="text-xs text-muted">Eklenme: {formatDate(r.created_at)}</p>
                </div>
                {r.user_id !== admin.id && <RemoveAdminButton userId={r.user_id} email={r.email} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Yeni yönetici ekle" description="Hesap hemen etkinleşir; e-posta doğrulaması gerekmez.">
        <Notice tone="info" className="mb-4">
          Yeni yönetici, size verdiği geçici şifreyle giriş yaptıktan sonra <strong>Hesabım</strong> sayfasından şifresini
          değiştirmelidir. Geçici şifreyi e-posta yerine güvenli bir kanaldan iletin.
        </Notice>
        <AddAdminForm />
      </Card>
    </div>
  );
}
