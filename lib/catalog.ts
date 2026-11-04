import { cacheLife, cacheTag } from "next/cache";
import { books as localBooks } from "@/data/catalog";
import { getSupabase } from "@/lib/supabase";
import type { Author, Book, Category } from "@/lib/types";

type BookRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  category: Category;
  series: string | null;
  imprint: string;
  translator: string | null;
  editor: string | null;
  cover_artist: string | null;
  edition: string | null;
  language: string;
  description: string | null;
  isbn: string | null;
  pages: number | null;
  published_year: number | null;
  price: number | null;
  buy_url: string | null;
  cover_url: string;
  cover_width: number;
  cover_height: number;
  cover_color: string;
  featured: boolean;
  sort_order: number;
  author: { slug: string; name: string; bio: string | null } | null;
};

function fromRow(r: BookRow): Book {
  return {
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    author: r.author ?? { slug: "bilinmiyor", name: "—" },
    category: r.category,
    series: r.series,
    imprint: r.imprint,
    translator: r.translator,
    editor: r.editor,
    coverArtist: r.cover_artist,
    edition: r.edition,
    language: r.language,
    description: r.description,
    isbn: r.isbn,
    pages: r.pages,
    publishedYear: r.published_year,
    price: r.price,
    buyUrl: r.buy_url,
    cover: {
      src: r.cover_url,
      width: r.cover_width,
      height: r.cover_height,
      color: r.cover_color,
    },
    featured: r.featured,
    sortOrder: r.sort_order,
  };
}

/** Tüm yayımlanmış kitaplar. Supabase tanımlıysa oradan, değilse yerel katalogdan. */
export async function getBooks(): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("books");

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("books")
      .select("*, author:authors(slug, name, bio)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (!error && data) return (data as BookRow[]).map(fromRow);
    console.error("[catalog] Supabase okunamadı, yerel kataloğa dönülüyor:", error?.message);
  }
  return [...localBooks].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBook(slug: string): Promise<Book | undefined> {
  const all = await getBooks();
  return all.find((b) => b.slug === slug);
}

export type AuthorWithBooks = Author & { books: Book[] };

export async function getAuthors(): Promise<AuthorWithBooks[]> {
  const all = await getBooks();
  const map = new Map<string, AuthorWithBooks>();
  for (const b of all) {
    const existing = map.get(b.author.slug);
    if (existing) existing.books.push(b);
    else map.set(b.author.slug, { ...b.author, books: [b] });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function getAuthor(slug: string): Promise<AuthorWithBooks | undefined> {
  const authors = await getAuthors();
  return authors.find((a) => a.slug === slug);
}
