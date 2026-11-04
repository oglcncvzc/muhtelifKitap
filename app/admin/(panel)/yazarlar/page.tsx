import type { Metadata } from "next";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { ButtonLink, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { AuthorList, type AuthorRow } from "./author-list";

export const metadata: Metadata = { title: "Yazarlar" };

export default function AuthorsPage({ searchParams }: PageProps<"/admin/yazarlar">) {
  return (
    <>
      <PageHeader
        title="Yazarlar"
        description="Yazarlar sayfasındaki sıra bu listedeki sırayla aynıdır. “Ana sayfada” işaretli yazarlar ana sayfada görünür."
        actions={
          <ButtonLink href="/admin/yazarlar/yeni" variant="primary">
            + Yeni yazar
          </ButtonLink>
        }
      />
      <Suspense fallback={<LoadingBlock rows={8} />}>
        <Authors searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Authors({ searchParams }: { searchParams: PageProps<"/admin/yazarlar">["searchParams"] }) {
  const { supabase } = await adminDb();
  const [{ data, error }, sp] = await Promise.all([
    supabase.from("authors").select("id, name, slug, photo_url, featured, book_authors(count)").order("sort_order").order("name"),
    searchParams,
  ]);
  if (error) return <Notice tone="error">Yazarlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  type Raw = Omit<AuthorRow, "books"> & { book_authors: { count: number }[] };
  const authors: AuthorRow[] = ((data ?? []) as unknown as Raw[]).map(({ book_authors, ...a }) => ({
    ...a,
    books: book_authors?.[0]?.count ?? 0,
  }));
  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <AuthorList authors={authors} />
    </>
  );
}
