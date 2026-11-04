"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { BookCard } from "@/components/site/book-card";
import { fold } from "@/components/site/header";
import { getDict, pick } from "@/lib/i18n";
import type { BookView, Category, Imprint, Locale, Series } from "@/lib/types";

type Facet = { key: "tur" | "dizi" | "yayinevi"; label: string; options: { slug: string; name: string; count: number }[] };

export function CatalogBrowser({
  lang,
  books,
  categories,
  series,
  imprints,
}: {
  lang: Locale;
  books: BookView[];
  categories: Category[];
  series: Series[];
  imprints: Imprint[];
}) {
  const t = getDict(lang);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sel, setSel] = useState({
    tur: params.get("tur") ?? "",
    dizi: params.get("dizi") ?? "",
    yayinevi: params.get("yayinevi") ?? "",
  });
  const [query, setQuery] = useState(params.get("q") ?? "");
  const q = useDeferredValue(query);

  const facets: Facet[] = useMemo(() => {
    const count = (fn: (b: BookView) => boolean) => books.filter(fn).length;
    return [
      {
        key: "tur" as const,
        label: t.genre,
        options: categories
          .map((c) => ({ slug: c.slug, name: pick(lang, c.name_tr, c.name_en), count: count((b) => b.category_id === c.id) }))
          .filter((o) => o.count),
      },
      {
        key: "dizi" as const,
        label: t.serie,
        options: series
          .map((s) => ({ slug: s.slug, name: pick(lang, s.name_tr, s.name_en), count: count((b) => b.series_id === s.id) }))
          .filter((o) => o.count),
      },
      {
        key: "yayinevi" as const,
        label: t.imprint,
        options: imprints
          .map((i) => ({ slug: i.slug, name: i.name, count: count((b) => b.imprint_id === i.id) }))
          .filter((o) => o.count),
      },
    ].filter((f) => f.options.length > 1 || (f.key !== "yayinevi" && f.options.length));
  }, [books, categories, series, imprints, lang, t]);

  const results = useMemo(() => {
    const f = fold(q.trim());
    return books.filter((b) => {
      if (sel.tur && b.category?.slug !== sel.tur) return false;
      if (sel.dizi && b.series?.slug !== sel.dizi) return false;
      if (sel.yayinevi && b.imprint?.slug !== sel.yayinevi) return false;
      if (!f) return true;
      return fold([b.title, b.title_en, b.subtitle, ...b.authors.map((a) => a.name)].filter(Boolean).join(" ")).includes(f);
    });
  }, [books, sel, q]);

  function sync(next: typeof sel, nextQ: string) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const setFacet = (key: Facet["key"], value: string) => {
    const next = { ...sel, [key]: value };
    setSel(next);
    sync(next, query);
  };

  const hasFilters = Boolean(sel.tur || sel.dizi || sel.yayinevi || query.trim());

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-rule py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          {facets.map((f) => (
            <div key={f.key} role="radiogroup" aria-label={f.label} className="flex flex-wrap items-center gap-2">
              <span className="label w-20 shrink-0 text-muted">{f.label}</span>
              {[{ slug: "", name: t.all, count: 0 }, ...f.options].map((o) => {
                const active = sel[f.key] === o.slug;
                return (
                  <button
                    key={o.slug || "all"}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFacet(f.key, o.slug)}
                    className={`h-9 border px-3.5 text-[15px] transition-colors ${
                      active ? "border-ink bg-ink text-paper" : "border-rule hover:border-ink"
                    }`}
                  >
                    {o.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <label className="relative block shrink-0 lg:w-72">
          <span className="sr-only">{t.searchPlaceholder}</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-muted">
            <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              sync(sel, e.target.value);
            }}
            placeholder={t.searchPlaceholder}
            className="h-10 w-full border-b border-ink bg-transparent pl-7 text-lg outline-none placeholder:text-muted placeholder:italic"
          />
        </label>
      </div>

      <div className="mt-6 mb-8 flex items-center justify-between">
        <p className="label text-muted" aria-live="polite">
          {t.results(results.length)}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              const empty = { tur: "", dizi: "", yayinevi: "" };
              setSel(empty);
              setQuery("");
              sync(empty, "");
            }}
            className="label text-muted underline underline-offset-4 hover:text-ink"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {results.length ? (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
          {results.map((b, i) => (
            <li key={b.id}>
              <BookCard book={b} lang={lang} priority={i < 4} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-20 text-center text-lg text-muted italic">{t.searchEmpty}</p>
      )}
    </div>
  );
}
