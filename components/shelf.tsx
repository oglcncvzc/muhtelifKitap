import Link from "next/link";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/book-card";

export function SectionHeading({
  index,
  title,
  count,
  href,
  linkLabel = "Tümünü gör",
  tone = "light",
}: {
  index?: string;
  title: string;
  count?: number;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
}) {
  const border = tone === "dark" ? "border-paper/20" : "border-ink";
  const muted = tone === "dark" ? "text-paper/55" : "text-muted";
  return (
    <div className={`flex items-end justify-between gap-6 border-b ${border} pb-4`}>
      <div className="flex items-end gap-4 sm:gap-6">
        {index && <span className={`label pb-2 ${muted}`}>{index}</span>}
        <h2 className="display text-5xl sm:text-7xl">{title}</h2>
        {typeof count === "number" && (
          <span className={`label pb-2 ${muted}`}>{String(count).padStart(2, "0")} kitap</span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="label shrink-0 pb-2 underline-offset-4 hover:underline"
        >
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export function Shelf({
  books,
  tone = "light",
  cols = 4,
}: {
  books: Book[];
  tone?: "light" | "dark";
  cols?: 3 | 4 | 5;
}) {
  const grid =
    cols === 5
      ? "lg:grid-cols-5"
      : cols === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";
  return (
    <ul className={`mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 ${grid}`}>
      {books.map((b) => (
        <li key={b.slug}>
          <BookCard book={b} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
