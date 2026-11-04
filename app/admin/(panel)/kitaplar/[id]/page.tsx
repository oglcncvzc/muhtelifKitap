import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { Badge, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { isUuid } from "@/lib/admin/form";
import { publicUrl } from "@/lib/admin/site";
import type { Book, BookAuthor, BookLink } from "@/lib/types";
import { BookForm } from "../book-form";
import { getBookOptions } from "../queries";

export const metadata: Metadata = { title: "Kitabı düzenle" };

export default function EditBookPage({ params, searchParams }: PageProps<"/admin/kitaplar/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Kitabı düzenle" back={{ href: "/admin/kitaplar", label: "Kitaplar" }} />
          <LoadingBlock rows={8} />
        </>
      }
    >
      <EditBook params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditBook({ params, searchParams }: Pick<PageProps<"/admin/kitaplar/[id]">, "params" | "searchParams">) {
  const [{ id }, sp, { supabase }] = await Promise.all([params, searchParams, adminDb()]);
  if (!isUuid(id)) notFound();

  const [book, authors, links, banners, settings, options] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    supabase.from("book_authors").select("*").eq("book_id", id).order("position"),
    supabase.from("book_links").select("*").eq("book_id", id).order("sort_order"),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("book_id", id),
    supabase.from("settings").select("featured_book_id").eq("id", 1).maybeSingle(),
    getBookOptions(supabase),
  ]);
  if (book.error) {
    return <Notice tone="error">Kitap yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  }
  if (!book.data) notFound();
  const b = book.data as Book;
  const { error: optionsError, ...opts } = options;

  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <PageHeader
        title={b.title}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            {b.is_published ? <Badge tone="green">Yayında</Badge> : <Badge>Taslak</Badge>}
            {b.is_new && <Badge tone="blue">Yeni</Badge>}
            {b.is_coming_soon && <Badge tone="amber">Yakında</Badge>}
          </span>
        }
        back={{ href: "/admin/kitaplar", label: "Kitaplar" }}
      />
      {(optionsError || authors.error || links.error) && (
        <Notice tone="error" className="mb-4">
          Bazı ilişkili veriler yüklenemedi. Kaydetmeden önce sayfayı yenileyin; aksi halde yazar ya da bağlantılar silinebilir.
        </Notice>
      )}
      <BookForm
        key={b.id}
        book={b}
        authorIds={((authors.data ?? []) as BookAuthor[]).map((a) => a.author_id)}
        links={((links.data ?? []) as BookLink[]).map((l) => ({ store_id: l.store_id, url: l.url }))}
        options={opts}
        publicHref={b.is_published ? publicUrl("books", b.slug) : undefined}
        bannerCount={banners.count ?? 0}
        isFeatured={settings.data?.featured_book_id === b.id}
      />
    </>
  );
}
