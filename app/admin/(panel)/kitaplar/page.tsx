import type { Metadata } from "next";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { ButtonLink, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { BookList, type BookRow } from "./book-list";

export const metadata: Metadata = { title: "Kitaplar" };

export default function BooksPage({ searchParams }: PageProps<"/admin/kitaplar">) {
  return (
    <>
      <PageHeader
        title="Kitaplar"
        description="Sitedeki kitap sırası bu listedeki sırayla aynıdır."
        actions={
          <ButtonLink href="/admin/kitaplar/yeni" variant="primary">
            + Yeni kitap
          </ButtonLink>
        }
      />
      <Suspense fallback={<LoadingBlock rows={8} />}>
        <Books searchParams={searchParams} />
      </Suspense>
    </>
  );
}

type Joined = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  cover_color: string;
  is_new: boolean;
  is_coming_soon: boolean;
  is_published: boolean;
  category: { name_tr: string } | null;
  series: { name_tr: string } | null;
  book_authors: { position: number; author: { name: string } | null }[];
};

async function Books({ searchParams }: { searchParams: PageProps<"/admin/kitaplar">["searchParams"] }) {
  const { supabase } = await adminDb();
  const [{ data, error }, sp] = await Promise.all([
    supabase
      .from("books")
      .select(
        "id, title, slug, cover_url, cover_color, is_new, is_coming_soon, is_published, category:categories(name_tr), series:series(name_tr), book_authors(position, author:authors(name))",
      )
      .order("sort_order")
      .order("title"),
    searchParams,
  ]);
  if (error) return <Notice tone="error">Kitaplar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;

  const books: BookRow[] = ((data ?? []) as unknown as Joined[]).map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    cover_url: b.cover_url,
    cover_color: b.cover_color,
    is_new: b.is_new,
    is_coming_soon: b.is_coming_soon,
    is_published: b.is_published,
    category: b.category?.name_tr ?? null,
    series: b.series?.name_tr ?? null,
    authors: [...b.book_authors].sort((x, y) => x.position - y.position).flatMap((x) => (x.author ? [x.author.name] : [])),
  }));

  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <BookList books={books} />
    </>
  );
}
