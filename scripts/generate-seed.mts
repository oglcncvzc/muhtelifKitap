/**
 * data/catalog.ts + data/content.ts → supabase/seed.sql (v2 şeması)
 * Kullanım: npm run seed:sql
 * Seed yalnızca ilk kurulum içindir; sonrasında içerik yönetim panelinden düzenlenir.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { books, categories, series, imprints, stores } from "../data/catalog.ts";
import { pages, settings } from "../data/content.ts";

const q = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};

const coverBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/`
  : "/covers/";

const out: string[] = ["-- Otomatik üretildi: npm run seed:sql", "begin;", ""];

const insert = (table: string, cols: string[], rows: unknown[][], conflict: string) => {
  if (!rows.length) return;
  out.push(`insert into public.${table} (${cols.join(", ")}) values`);
  out.push(rows.map((r) => `  (${r.join(", ")})`).join(",\n"));
  out.push(`on conflict ${conflict};`, "");
};

insert("categories", ["slug", "name_tr", "name_en", "sort_order"],
  categories.map((c, i) => [q(c.slug), q(c.tr), q(c.en), q((i + 1) * 10)]), "(slug) do nothing");

insert("series", ["slug", "name_tr", "name_en", "description_tr", "description_en", "sort_order"],
  series.map((s, i) => [q(s.slug), q(s.tr), q(s.en), q(s.descTr), q(s.descEn), q((i + 1) * 10)]), "(slug) do nothing");

insert("imprints", ["slug", "name", "logo_url", "sort_order"],
  imprints.map((m, i) => [q(m.slug), q(m.name), q(m.logo), q((i + 1) * 10)]), "(slug) do nothing");

insert("stores", ["slug", "name", "sort_order"],
  stores.map((s, i) => [q(s.slug), q(s.name), q((i + 1) * 10)]), "(slug) do nothing");

const authors = new Map<string, string>();
for (const b of books) authors.set(b.author.slug, b.author.name);
insert("authors", ["slug", "name", "featured", "sort_order"],
  [...authors].map(([slug, name], i) => [q(slug), q(name), q(i < 6), q((i + 1) * 10)]), "(slug) do nothing");

const sel = (table: string, slug?: string | null) =>
  slug ? `(select id from public.${table} where slug = ${q(slug)})` : "null";

insert(
  "books",
  ["slug", "title", "subtitle", "category_id", "series_id", "imprint_id", "language", "editor", "translator",
    "cover_designer", "edition", "cover_url", "cover_width", "cover_height", "cover_color", "is_new", "sort_order"],
  books.map((b) => [
    q(b.slug), q(b.title), q(b.subtitle), sel("categories", b.category), sel("series", b.series),
    sel("imprints", b.imprint), q(b.language), q(b.editor), q(b.translator), q(b.coverDesigner),
    q(b.edition), q(`${coverBase}${b.slug}.webp`), q(b.cover.width), q(b.cover.height), q(b.cover.color),
    q(b.isNew ?? false), q(b.sortOrder),
  ]),
  "(slug) do nothing",
);

insert("book_authors", ["book_id", "author_id", "position"],
  books.map((b) => [sel("books", b.slug), sel("authors", b.author.slug), "0"]), "do nothing");

insert("pages", ["slug", "title_tr", "title_en", "body_tr", "body_en"],
  pages.map((p) => [q(p.slug), q(p.titleTr), q(p.titleEn), q(p.bodyTr), q(p.bodyEn)]), "(slug) do nothing");

out.push(
  `update public.settings set ` +
    Object.entries(settings)
      .map(([k, v]) => (k === "featured_book_slug" ? `featured_book_id = ${sel("books", v as string)}` : `${k} = ${q(v)}`))
      .join(", ") +
    " where id = 1;",
  "",
  "commit;",
  "",
);

writeFileSync(fileURLToPath(new URL("../supabase/seed.sql", import.meta.url)), out.join("\n"));
console.log(`✓ ${books.length} kitap, ${authors.size} yazar, ${pages.length} sayfa → supabase/seed.sql`);
