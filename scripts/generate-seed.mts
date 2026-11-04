/**
 * data/catalog.ts içeriğinden supabase/seed.sql üretir.
 * Kullanım: npm run seed:sql
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { books } from "../data/catalog.ts";

const q = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};

const authors = new Map<string, { slug: string; name: string; bio?: string | null }>();
for (const b of books) authors.set(b.author.slug, b.author);

const lines: string[] = [
  "-- Otomatik üretildi: npm run seed:sql (kaynak: data/catalog.ts)",
  "begin;",
  "",
  "insert into public.authors (slug, name, bio) values",
  [...authors.values()].map((a) => `  (${q(a.slug)}, ${q(a.name)}, ${q(a.bio)})`).join(",\n"),
  "on conflict (slug) do update set name = excluded.name, bio = coalesce(excluded.bio, public.authors.bio);",
  "",
];

const cols = [
  "slug", "title", "subtitle", "author_id", "category", "series", "imprint", "translator", "editor",
  "cover_artist", "edition", "language", "description", "isbn", "pages", "published_year", "price",
  "buy_url", "cover_url", "cover_width", "cover_height", "cover_color", "featured", "sort_order",
];

lines.push(`insert into public.books (${cols.join(", ")}) values`);
lines.push(
  books
    .map((b) =>
      "  (" +
      [
        q(b.slug), q(b.title), q(b.subtitle),
        `(select id from public.authors where slug = ${q(b.author.slug)})`,
        `${q(b.category)}::public.book_category`,
        q(b.series), q(b.imprint), q(b.translator), q(b.editor), q(b.coverArtist), q(b.edition),
        q(b.language), q(b.description), q(b.isbn), q(b.pages), q(b.publishedYear), q(b.price),
        q(b.buyUrl), q(b.cover.src), q(b.cover.width), q(b.cover.height), q(b.cover.color),
        q(b.featured), q(b.sortOrder),
      ].join(", ") +
      ")",
    )
    .join(",\n"),
);
lines.push(
  "on conflict (slug) do update set " +
    cols
      .filter((c) => c !== "slug" && c !== "description" && c !== "cover_url")
      .map((c) => `${c} = excluded.${c}`)
      .join(", ") +
    ";",
);
lines.push("", "commit;", "");

const out = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));
writeFileSync(out, lines.join("\n"));
console.log(`✓ ${authors.size} yazar, ${books.length} kitap → supabase/seed.sql`);
