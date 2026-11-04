"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDict, href, switchLocalePath, type RouteKey } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export type SearchItem =
  | { type: "book"; slug: string; title: string; sub: string; cover: string | null; color: string }
  | { type: "author"; slug: string; title: string; sub: string };

export const fold = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");

const NAV: RouteKey[] = ["books", "authors", "about", "contact"];

export function Header({ lang, index }: { lang: Locale; index: SearchItem[] }) {
  const t = getDict(lang);
  const pathname = usePathname();
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuAt === pathname;

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (key: RouteKey) => {
    const base = href(lang, key);
    return pathname === base || pathname.startsWith(base + "/");
  };

  const other: Locale = lang === "tr" ? "en" : "tr";

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-4 sm:h-[72px] sm:px-8">
        <Link href={href(lang)} aria-label={`Muhtelif Kitap — ${lang === "tr" ? "ana sayfa" : "home"}`} className="shrink-0">
          <Image src="/brand/muhtelif-logo.png" alt="Muhtelif Kitap" width={951} height={564} priority className="h-9 w-auto sm:h-10" />
        </Link>

        <nav aria-label={lang === "tr" ? "Ana menü" : "Main menu"} className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((key) => (
              <li key={key}>
                <Link
                  href={href(lang, key)}
                  aria-current={active(key) ? "page" : undefined}
                  className="text-[15px] text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline decoration-1 underline-offset-[6px]"
                >
                  {t.nav[key as "books"]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <LangSwitch lang={lang} pathname={pathname} other={other} />
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center hover:bg-paper-2"
            aria-label={t.nav.search}
            aria-haspopup="dialog"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobil-menu"
            aria-label={menuOpen ? t.close : t.menu}
            onClick={() => setMenuAt(menuOpen ? null : pathname)}
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span className={`absolute left-0 h-px w-5 bg-ink transition-transform ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-5 bg-ink transition-transform ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>

      <div id="mobil-menu" hidden={!menuOpen} className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-paper md:hidden">
        <nav aria-label={lang === "tr" ? "Mobil menü" : "Mobile menu"} className="px-4 pt-4">
          <ul className="divide-y divide-rule border-b border-rule">
            {NAV.map((key) => (
              <li key={key}>
                <Link href={href(lang, key)} className="display flex items-center justify-between py-5 text-4xl">
                  {t.nav[key as "books"]}
                  <span aria-hidden className="font-serif text-xl normal-case">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {searchOpen && <SearchDialog lang={lang} index={index} onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function LangSwitch({ lang, pathname, other }: { lang: Locale; pathname: string; other: Locale }) {
  return (
    <div className="label flex items-center" aria-label={lang === "tr" ? "Dil seçimi" : "Language"}>
      {(["tr", "en"] as Locale[]).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="px-1 text-muted">/</span>}
          {l === lang ? (
            <span aria-current="true" className="px-1 py-3 text-ink">
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={switchLocalePath(pathname, other)}
              hrefLang={other}
              lang={other}
              className="px-1 py-3 text-muted hover:text-ink"
              aria-label={other === "en" ? "English" : "Türkçe"}
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-[18px] w-[18px]">
      <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SearchDialog({ lang, index, onClose }: { lang: Locale; index: SearchItem[]; onClose: () => void }) {
  const t = getDict(lang);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const f = fold(q.trim());
    if (!f) return [];
    return index.filter((i) => fold(`${i.title} ${i.sub}`).includes(f)).slice(0, 8);
  }, [q, index]);

  const go = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={t.nav.search} className="fixed inset-0 z-50">
      <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div className="relative mx-auto mt-0 w-full max-w-2xl bg-paper shadow-2xl sm:mt-24">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            go(`${href(lang, "books")}?q=${encodeURIComponent(q.trim())}`);
          }}
          className="flex items-center gap-3 border-b border-rule px-5"
        >
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-16 flex-1 bg-transparent text-xl outline-none placeholder:text-muted placeholder:italic"
            aria-label={t.searchPlaceholder}
          />
          <button type="button" onClick={onClose} className="label text-muted hover:text-ink">
            Esc
          </button>
        </form>
        {q.trim() && (
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {results.length === 0 && <li className="px-5 py-6 text-muted italic">{t.searchEmpty}</li>}
            {results.map((r) => (
              <li key={`${r.type}-${r.slug}`}>
                <Link
                  href={href(lang, r.type === "book" ? "books" : "authors", r.slug)}
                  onClick={onClose}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-paper-2 focus:bg-paper-2 focus:outline-none"
                >
                  {r.type === "book" ? (
                    <span className="block h-14 w-10 shrink-0 overflow-hidden" style={{ background: r.color }}>
                      {r.cover && <Image src={r.cover} alt="" width={80} height={120} className="h-full w-full object-cover" />}
                    </span>
                  ) : (
                    <span className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-3 text-lg">
                      {r.title.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-lg leading-tight">{r.title}</span>
                    <span className="block text-sm text-muted">{r.sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
