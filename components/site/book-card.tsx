import Image from "next/image";
import Link from "next/link";
import { getDict, href, pick } from "@/lib/i18n";
import type { BookView, Locale } from "@/lib/types";

export const bookTitle = (lang: Locale, b: Pick<BookView, "title" | "title_en">) => pick(lang, b.title, b.title_en);
export const bookAuthors = (b: Pick<BookView, "authors">) => b.authors.map((a) => a.name).join(", ");

export function Cover({
  book,
  lang,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw",
  priority,
  className = "",
}: {
  book: BookView;
  lang: Locale;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`cover relative overflow-hidden ${className}`}
      style={{ backgroundColor: book.cover_color, aspectRatio: `${book.cover_width} / ${book.cover_height}` }}
    >
      {book.cover_url && (
        <Image
          src={book.cover_url}
          alt={`${bookTitle(lang, book)} — ${bookAuthors(book)}`}
          width={book.cover_width}
          height={book.cover_height}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function Badges({ book, lang }: { book: BookView; lang: Locale }) {
  const t = getDict(lang);
  if (!book.is_new && !book.is_coming_soon) return null;
  return (
    <span className="absolute top-2 left-2 z-10 flex gap-1">
      {book.is_coming_soon ? (
        <span className="label bg-paper px-2 py-1 text-ink">{t.badgeSoon}</span>
      ) : (
        <span className="label bg-ink px-2 py-1 text-paper">{t.badgeNew}</span>
      )}
    </span>
  );
}

export function BookCard({
  book,
  lang,
  priority,
  sizes,
}: {
  book: BookView;
  lang: Locale;
  priority?: boolean;
  sizes?: string;
}) {
  const genre = book.category ? pick(lang, book.category.name_tr, book.category.name_en) : null;
  return (
    <Link href={href(lang, "books", book.slug)} className="group block">
      {/* Kapak oranları farklı (≈1:1.5–1:1.63); en uzun orana göre kutu, kapak alta yaslı → başlıklar hizalı */}
      <div className="flex aspect-[100/163] items-end">
        <div className="relative w-full">
          <Badges book={book} lang={lang} />
          <Cover book={book} lang={lang} priority={priority} sizes={sizes} className="w-full" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg leading-snug font-medium text-balance group-hover:underline decoration-1 underline-offset-4">
          {bookTitle(lang, book)}
        </h3>
        <p className="mt-0.5 text-ink-2">{bookAuthors(book)}</p>
        {genre && <p className="label mt-2 text-muted">{genre}</p>}
      </div>
    </Link>
  );
}

export function BookGrid({ books, lang, eager = 0 }: { books: BookView[]; lang: Locale; eager?: number }) {
  return (
    <ul className="reveal-grid grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
      {books.map((b, i) => (
        <li key={b.id} className="reveal">
          <BookCard book={b} lang={lang} priority={i < eager} />
        </li>
      ))}
    </ul>
  );
}
