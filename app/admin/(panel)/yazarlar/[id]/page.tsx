import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { Badge, Card, LoadingBlock, Notice, PageHeader, Thumb } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { isUuid } from "@/lib/admin/form";
import { publicUrl } from "@/lib/admin/site";
import type { Author } from "@/lib/types";
import { AuthorForm } from "../author-form";

export const metadata: Metadata = { title: "Yazarı düzenle" };

export default function EditAuthorPage({ params, searchParams }: PageProps<"/admin/yazarlar/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Yazarı düzenle" back={{ href: "/admin/yazarlar", label: "Yazarlar" }} />
          <LoadingBlock rows={6} />
        </>
      }
    >
      <EditAuthor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

type BookRef = { position: number; book: { id: string; title: string; cover_url: string | null; cover_color: string; is_published: boolean } | null };

async function EditAuthor({ params, searchParams }: Pick<PageProps<"/admin/yazarlar/[id]">, "params" | "searchParams">) {
  const [{ id }, sp, { supabase }] = await Promise.all([params, searchParams, adminDb()]);
  if (!isUuid(id)) notFound();
  const [author, books] = await Promise.all([
    supabase.from("authors").select("*").eq("id", id).maybeSingle(),
    supabase.from("book_authors").select("position, book:books(id, title, cover_url, cover_color, is_published)").eq("author_id", id),
  ]);
  if (author.error) return <Notice tone="error">Yazar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  if (!author.data) notFound();
  const a = author.data as Author;
  const refs = ((books.data ?? []) as unknown as BookRef[]).flatMap((r) => (r.book ? [r.book] : []));

  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <PageHeader title={a.name} back={{ href: "/admin/yazarlar", label: "Yazarlar" }} />
      <div className="space-y-6">
        <AuthorForm key={a.id} author={a} bookCount={refs.length} publicHref={publicUrl("authors", a.slug)} />
        <Card title={`Kitapları (${refs.length})`} description="Yazar–kitap eşleştirmesi kitap düzenleme sayfasından yapılır.">
          {refs.length === 0 ? (
            <p className="text-sm text-muted">Bu yazara bağlı kitap yok.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {refs.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/kitaplar/${b.id}`} className="flex items-center gap-3 rounded-md border border-rule p-2 hover:bg-paper/50">
                    <Thumb src={b.cover_url} color={b.cover_color} className="h-12 w-8 shrink-0 rounded-sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{b.title}</span>
                    {!b.is_published && <Badge>Taslak</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
