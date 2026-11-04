import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { Badge, cx, EmptyState, formatDate, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import type { ContactMessage } from "@/lib/types";
import { DeleteMessage, ReadToggle } from "./message-controls";
import { SUBJECT_LABELS } from "./subjects";

export const metadata: Metadata = { title: "Mesajlar" };

export default function MessagesPage({ searchParams }: PageProps<"/admin/mesajlar">) {
  return (
    <>
      <PageHeader title="Mesajlar" description="İletişim formundan gelen mesajlar, en yeniden eskiye." />
      <Suspense fallback={<LoadingBlock rows={6} />}>
        <Messages searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Messages({ searchParams }: { searchParams: PageProps<"/admin/mesajlar">["searchParams"] }) {
  const { supabase } = await adminDb();
  const sp = await searchParams;
  const onlyUnread = sp.filtre === "okunmamis";
  let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(300);
  if (onlyUnread) query = query.eq("is_read", false);
  const { data, error } = await query;
  if (error) return <Notice tone="error">Mesajlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  const messages = (data ?? []) as ContactMessage[];

  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <nav aria-label="Filtre" className="mb-4 flex gap-1 text-sm">
        {[
          ["/admin/mesajlar", "Tümü", !onlyUnread],
          ["/admin/mesajlar?filtre=okunmamis", "Okunmamış", onlyUnread],
        ].map(([href, label, active]) => (
          <Link
            key={String(href)}
            href={String(href)}
            aria-current={active ? "page" : undefined}
            className={cx("rounded-md px-3 py-1.5", active ? "bg-ink text-white" : "text-ink-2 hover:bg-paper-2")}
          >
            {label}
          </Link>
        ))}
      </nav>
      {messages.length === 0 ? (
        <EmptyState title={onlyUnread ? "Okunmamış mesaj yok." : "Henüz mesaj yok."}>İletişim formundan gelen mesajlar burada görünür.</EmptyState>
      ) : (
        <ul className="divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-white">
          {messages.map((m) => (
            <li key={m.id} className={cx("flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center", !m.is_read && "bg-sky-50/60")}>
              <Link href={`/admin/mesajlar/${m.id}`} className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={cx("mt-2 size-2 shrink-0 rounded-full", m.is_read ? "bg-transparent" : "bg-sky-600")}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className={cx("block truncate text-sm", !m.is_read && "font-semibold")}>
                    {!m.is_read && <span className="sr-only">Okunmamış: </span>}
                    {m.name} <span className="font-normal text-muted">· {m.email}</span>
                  </span>
                  <span className="block truncate text-sm text-muted">{m.message}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge>{SUBJECT_LABELS[m.subject] ?? m.subject}</Badge>
                    {formatDate(m.created_at, true)}
                  </span>
                </span>
              </Link>
              <div className="flex shrink-0 gap-2 pl-5 sm:pl-0">
                <ReadToggle id={m.id} isRead={m.is_read} size="sm" />
                <DeleteMessage id={m.id} size="sm" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
