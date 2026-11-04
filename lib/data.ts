import { cacheLife, cacheTag } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import type {
  Author,
  Banner,
  Book,
  BookAuthor,
  BookLink,
  BookView,
  Category,
  Imprint,
  Page,
  Series,
  Settings,
  Store,
} from "@/lib/types";

export const CATALOG_TAG = "catalog";

export type Catalog = {
  books: BookView[];
  authors: (Author & { bookIds: string[] })[];
  categories: Category[];
  series: Series[];
  imprints: Imprint[];
  stores: Store[];
  banners: Banner[];
  pages: Page[];
  settings: Settings | null;
};

const EMPTY: Catalog = {
  books: [],
  authors: [],
  categories: [],
  series: [],
  imprints: [],
  stores: [],
  banners: [],
  pages: [],
  settings: null,
};

/**
 * Sitenin tüm herkese açık içeriği tek seferde (katalog küçük; ~yüzlerce kayıt).
 * 'catalog' etiketiyle önbelleklenir; panelden kayıt yapılınca updateTag ile,
 * Supabase'den doğrudan değişiklikte /api/revalidate ile yenilenir.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const sb = getSupabase();
  if (!sb) return EMPTY;

  const order = { ascending: true } as const;
  const [books, authors, bookAuthors, links, categories, series, imprints, stores, banners, pages, settings] =
    await Promise.all([
      sb.from("books").select("*").order("sort_order", order),
      sb.from("authors").select("*").order("sort_order", order),
      sb.from("book_authors").select("*").order("position", order),
      sb.from("book_links").select("*").order("sort_order", order),
      sb.from("categories").select("*").order("sort_order", order),
      sb.from("series").select("*").order("sort_order", order),
      sb.from("imprints").select("*").order("sort_order", order),
      sb.from("stores").select("*").order("sort_order", order),
      sb.from("banners").select("*").order("sort_order", order),
      sb.from("pages").select("*"),
      sb.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const firstError = [books, authors, bookAuthors, links, categories, series, imprints, stores, banners, pages, settings]
    .map((r) => r.error)
    .find(Boolean);
  if (firstError) {
    console.error("[data] Supabase okunamadı:", firstError.message);
    throw new Error("Katalog okunamadı");
  }

  const authorById = new Map((authors.data as Author[]).map((a) => [a.id, a]));
  const storeById = new Map((stores.data as Store[]).map((s) => [s.id, s]));
  const catById = new Map((categories.data as Category[]).map((c) => [c.id, c]));
  const serById = new Map((series.data as Series[]).map((s) => [s.id, s]));
  const impById = new Map((imprints.data as Imprint[]).map((i) => [i.id, i]));

  const ba = bookAuthors.data as BookAuthor[];
  const bl = links.data as BookLink[];

  const bookViews: BookView[] = (books.data as Book[]).map((b) => ({
    ...b,
    authors: ba
      .filter((x) => x.book_id === b.id)
      .map((x) => authorById.get(x.author_id))
      .filter((a): a is Author => Boolean(a)),
    category: (b.category_id && catById.get(b.category_id)) || null,
    series: (b.series_id && serById.get(b.series_id)) || null,
    imprint: (b.imprint_id && impById.get(b.imprint_id)) || null,
    links: bl
      .filter((l) => l.book_id === b.id && storeById.has(l.store_id))
      .map((l) => ({ ...l, store: storeById.get(l.store_id)! })),
  }));

  const publishedIds = new Set(bookViews.map((b) => b.id));
  const authorsWithBooks = (authors.data as Author[]).map((a) => ({
    ...a,
    bookIds: ba.filter((x) => x.author_id === a.id && publishedIds.has(x.book_id)).map((x) => x.book_id),
  }));

  return {
    books: bookViews,
    authors: authorsWithBooks,
    categories: categories.data as Category[],
    series: series.data as Series[],
    imprints: imprints.data as Imprint[],
    stores: stores.data as Store[],
    banners: banners.data as Banner[],
    pages: pages.data as Page[],
    settings: (settings.data as Settings) ?? null,
  };
}

export async function getBookBySlug(slug: string) {
  const c = await getCatalog();
  return c.books.find((b) => b.slug === slug);
}

export async function getAuthorBySlug(slug: string) {
  const c = await getCatalog();
  const author = c.authors.find((a) => a.slug === slug);
  if (!author) return undefined;
  return { ...author, books: c.books.filter((b) => author.bookIds.includes(b.id)) };
}

export async function getPage(slug: string) {
  const c = await getCatalog();
  return c.pages.find((p) => p.slug === slug);
}
