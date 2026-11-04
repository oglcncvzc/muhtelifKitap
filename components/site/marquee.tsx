import Link from "next/link";
import { bookTitle } from "@/components/site/book-card";
import { href } from "@/lib/i18n";
import type { BookView, Locale } from "@/lib/types";

/** Kayan kitap adları şeridi. Kesintisiz döngü için liste iki kez basılır; ikinci kopya ekran okuyuculardan gizlenir. */
export function Marquee({ books, lang }: { books: BookView[]; lang: Locale }) {
  if (books.length < 3) return null;
  const row = (copy: number) =>
    books.map((b) => (
      <li key={`${copy}-${b.id}`} className="flex items-center gap-10" aria-hidden={copy > 0 || undefined}>
        <Link
          href={href(lang, "books", b.slug)}
          tabIndex={copy > 0 ? -1 : undefined}
          className="display text-3xl text-paper/90 transition-colors hover:text-paper sm:text-4xl"
        >
          {bookTitle(lang, b)}
        </Link>
        <span aria-hidden className="text-paper/35">
          ✦
        </span>
      </li>
    ));
  return (
    <nav aria-label={lang === "tr" ? "Tüm kitaplar" : "All books"} className="marquee mt-6 overflow-hidden bg-ink py-4 sm:mt-8">
      <ul className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {row(0)}
        {row(1)}
      </ul>
    </nav>
  );
}
