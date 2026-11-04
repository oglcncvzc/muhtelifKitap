import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, type Book } from "@/lib/types";

type Props = {
  book: Book;
  sizes?: string;
  priority?: boolean;
  tone?: "light" | "dark";
  showCategory?: boolean;
};

export function BookCover({
  book,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw",
  priority,
  className = "",
}: {
  book: Book;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`book overflow-hidden ${className}`}
      style={{ backgroundColor: book.cover.color, aspectRatio: "2 / 3" }}
    >
      <Image
        src={book.cover.src}
        alt={`${book.title} kapağı`}
        width={book.cover.width}
        height={book.cover.height}
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function BookCard({ book, sizes, priority, tone = "light", showCategory = true }: Props) {
  const muted = tone === "dark" ? "text-paper/55" : "text-muted";
  return (
    <Link href={`/kitaplar/${book.slug}`} className="group block outline-none">
      <BookCover book={book} sizes={sizes} priority={priority} />
      <div className="mt-5">
        {showCategory && (
          <p className={`label ${muted}`}>
            {book.series ?? CATEGORY_LABELS[book.category]}
            {book.edition ? ` · ${book.edition}` : ""}
          </p>
        )}
        <h3 className="mt-1.5 text-xl leading-tight font-medium text-balance">
          <span className="bg-[length:0_1px] bg-left-bottom bg-no-repeat bg-gradient-to-r from-current to-current transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
            {book.title}
          </span>
        </h3>
        <p className={`mt-1 italic ${muted}`}>{book.author.name}</p>
      </div>
    </Link>
  );
}
