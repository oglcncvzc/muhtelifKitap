"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { CATEGORY_LABELS, CATEGORY_ORDER, type Book, type Category } from "@/lib/types";

const fold = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");

type Filter = "tumu" | Category | "spekulatif";

export function CatalogBrowser({ books }: { books: Book[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial: Filter =
    params.get("dizi") === "spekulatif"
      ? "spekulatif"
      : (CATEGORY_ORDER.find((c) => c === params.get("tur")) ?? "tumu");

  const [filter, setFilter] = useState<Filter>(initial);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);

  const counts = useMemo(() => {
    const c: Record<string, number> = { tumu: books.length, spekulatif: 0 };
    for (const b of books) {
      c[b.category] = (c[b.category] ?? 0) + 1;
      if (b.series === "Muhtelif Spekülatif") c.spekulatif++;
    }
    return c;
  }, [books]);

  const options: { value: Filter; label: string }[] = [
    { value: "tumu", label: "Tümü" },
    ...CATEGORY_ORDER.filter((c) => counts[c]).map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
    { value: "spekulatif", label: "Spekülatif dizi" },
  ];

  const results = useMemo(() => {
    const q = fold(deferredQuery.trim());
    return books.filter((b) => {
      if (filter === "spekulatif" && b.series !== "Muhtelif Spekülatif") return false;
      if (filter !== "tumu" && filter !== "spekulatif" && b.category !== filter) return false;
      if (!q) return true;
      return fold(
        [b.title, b.subtitle, b.author.name, b.translator, b.editor, b.series].filter(Boolean).join(" "),
      ).includes(q);
    });
  }, [books, filter, deferredQuery]);

  function syncUrl(next: Filter, q: string) {
    const sp = new URLSearchParams();
    if (next === "spekulatif") sp.set("dizi", "spekulatif");
    else if (next !== "tumu") sp.set("tur", next);
    if (q.trim()) sp.set("q", q.trim());
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-rule bg-paper/95 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="radiogroup" aria-label="Türe göre filtrele" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {options.map((o) => {
              const active = filter === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setFilter(o.value);
                    syncUrl(o.value, query);
                  }}
                  className={`label flex h-10 shrink-0 items-center gap-2 border px-4 transition-colors ${
                    active ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink"
                  }`}
                >
                  {o.label}
                  <span className={active ? "text-paper/60" : "text-muted"}>{counts[o.value] ?? 0}</span>
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-80">
            <span className="sr-only">Kitap, yazar veya çevirmen ara</span>
            <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-muted">
              <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                syncUrl(filter, e.target.value);
              }}
              placeholder="Kitap, yazar, çevirmen…"
              className="h-10 w-full border-b border-ink bg-transparent pl-7 text-lg outline-none placeholder:text-muted placeholder:italic"
            />
          </label>
        </div>
      </div>

      <p className="label mt-8 text-muted" aria-live="polite">
        {results.length} kitap
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((b, i) => (
            <li key={b.slug} className="rise" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
              <BookCard book={b} priority={i < 5} sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 border-t border-rule pt-16 text-center">
          <p className="display text-5xl">Bulunamadı</p>
          <p className="mt-3 text-lg text-muted italic">“{query}” için sonuç yok. Başka bir arama deneyin.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("tumu");
              syncUrl("tumu", "");
            }}
            className="label mt-8 h-11 border border-ink px-5 hover:bg-ink hover:text-paper"
          >
            Filtreleri temizle
          </button>
        </div>
      )}
    </div>
  );
}
