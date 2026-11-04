import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { Badge, ButtonLink, Card, cx, EmptyState, formatDate, Notice, PageHeader, Skeleton } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { PUBLIC_SITE_URL } from "@/lib/admin/site";
import type { ContactMessage } from "@/lib/types";
import { SUBJECT_LABELS } from "./mesajlar/subjects";

export const metadata: Metadata = { title: "Genel bakış" };

export default function DashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <PageHeader
        title="Genel bakış"
        description="Kataloğun durumu, son mesajlar ve sık kullanılan işlemler."
        actions={
          <a href={PUBLIC_SITE_URL} target="_blank" rel="noreferrer" className="text-sm text-ink-2 underline-offset-2 hover:underline">
            Siteyi görüntüle ↗
          </a>
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Yükleniyor">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const { supabase } = await adminDb();
  const head = { count: "exact", head: true } as const;
  const [books, drafts, authors, banners, unread, messages, sp] = await Promise.all([
    supabase.from("books").select("id", head),
    supabase.from("books").select("id", head).eq("is_published", false),
    supabase.from("authors").select("id", head),
    supabase.from("banners").select("id", head).eq("is_active", true),
    supabase.from("contact_messages").select("id", head).eq("is_read", false),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
    searchParams,
  ]);
  const failed = [books, authors, banners, unread, messages].some((r) => r.error);
  const latest = (messages.data ?? []) as ContactMessage[];
  const durum = typeof sp.durum === "string" ? sp.durum : null;

  const stats = [
    { label: "Kitap", value: books.count, href: "/admin/kitaplar", note: drafts.count ? `${drafts.count} taslak` : "Tümü yayında" },
    { label: "Yazar", value: authors.count, href: "/admin/yazarlar" },
    { label: "Etkin banner", value: banners.count, href: "/admin/bannerlar", note: (banners.count ?? 0) > 4 ? "4'ten fazla!" : "En fazla 3–4 önerilir" },
    { label: "Okunmamış mesaj", value: unread.count, href: "/admin/mesajlar", highlight: (unread.count ?? 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      {durum === "sifre" ? <PasswordFlash /> : null}
      {failed && <Notice tone="error">Bazı veriler yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={cx(
              "rounded-lg border bg-white p-4 transition-colors hover:border-ink/40",
              s.highlight ? "border-ink/40" : "border-rule",
            )}
          >
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{s.value ?? "—"}</p>
            {s.note && <p className="mt-1 text-xs text-muted">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card
          title="Son mesajlar"
          actions={
            <Link href="/admin/mesajlar" className="text-sm text-ink-2 hover:underline">
              Tümü →
            </Link>
          }
        >
          {latest.length === 0 ? (
            <EmptyState title="Henüz mesaj yok.">İletişim formundan gelen mesajlar burada görünür.</EmptyState>
          ) : (
            <ul className="-my-2 divide-y divide-rule">
              {latest.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/mesajlar/${m.id}`} className="flex items-start gap-3 py-2.5 hover:bg-paper/40">
                    <span
                      className={cx("mt-1.5 size-2 shrink-0 rounded-full", m.is_read ? "bg-transparent" : "bg-ink")}
                      aria-label={m.is_read ? undefined : "Okunmamış"}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={cx("truncate text-sm", !m.is_read && "font-semibold")}>
                        {m.name} <span className="font-normal text-muted">· {m.email}</span>
                      </p>
                      <p className="truncate text-sm text-muted">{m.message}</p>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      <Badge>{SUBJECT_LABELS[m.subject] ?? m.subject}</Badge>
                      <span className="text-xs text-muted">{formatDate(m.created_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Hızlı işlemler">
          <div className="grid gap-2">
            <ButtonLink href="/admin/kitaplar/yeni" variant="primary">
              + Yeni kitap
            </ButtonLink>
            <ButtonLink href="/admin/yazarlar/yeni">+ Yeni yazar</ButtonLink>
            <ButtonLink href="/admin/bannerlar/yeni">+ Yeni banner</ButtonLink>
            <ButtonLink href="/admin/ayarlar">Öne çıkan kitabı değiştir</ButtonLink>
            <ButtonLink href="/admin/sayfalar">Sayfa metinleri</ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PasswordFlash() {
  return <Flash code="sifre" />;
}
