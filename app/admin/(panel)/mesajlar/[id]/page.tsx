import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge, buttonClass, Card, formatDate, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { isUuid } from "@/lib/admin/form";
import type { ContactMessage } from "@/lib/types";
import { DeleteMessage, MarkReadOnOpen, ReadToggle } from "../message-controls";
import { SUBJECT_LABELS } from "../subjects";

export const metadata: Metadata = { title: "Mesaj" };

export default function MessagePage({ params }: PageProps<"/admin/mesajlar/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Mesaj" back={{ href: "/admin/mesajlar", label: "Mesajlar" }} />
          <LoadingBlock rows={4} />
        </>
      }
    >
      <Message params={params} />
    </Suspense>
  );
}

async function Message({ params }: Pick<PageProps<"/admin/mesajlar/[id]">, "params">) {
  const [{ id }, { supabase }] = await Promise.all([params, adminDb()]);
  if (!isUuid(id)) notFound();
  const { data, error } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (error) return <Notice tone="error">Mesaj yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  if (!data) notFound();
  const m = data as ContactMessage;
  const subject = SUBJECT_LABELS[m.subject] ?? m.subject;
  const mailto = `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Muhtelif Kitap – ${subject}`)}`;

  return (
    <>
      <MarkReadOnOpen id={m.id} isRead={m.is_read} />
      <PageHeader
        title={m.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge>{subject}</Badge> {formatDate(m.created_at, true)}
          </span>
        }
        back={{ href: "/admin/mesajlar", label: "Mesajlar" }}
        actions={
          <>
            <a href={mailto} className={buttonClass("primary")}>
              E-postayla yanıtla
            </a>
            <ReadToggle id={m.id} isRead={m.is_read} />
            <DeleteMessage id={m.id} backToList />
          </>
        }
      />
      <Card>
        <dl className="mb-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-muted">Gönderen</dt>
          <dd>{m.name}</dd>
          <dt className="text-muted">E-posta</dt>
          <dd>
            <a href={mailto} className="underline underline-offset-2 break-all">
              {m.email}
            </a>
          </dd>
        </dl>
        <div className="border-t border-rule pt-4 text-[15px] leading-relaxed whitespace-pre-wrap">{m.message}</div>
      </Card>
    </>
  );
}
