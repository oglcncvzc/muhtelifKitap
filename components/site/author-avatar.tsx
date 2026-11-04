import Image from "next/image";
import type { Author, BookView } from "@/lib/types";

/** Yazar fotoğrafı; yoksa yazarın ilk kitabının kapağından kırpılmış nötr bir görsel, o da yoksa baş harf. */
export function AuthorAvatar({
  author,
  fallbackBook,
  className = "",
  sizes = "(min-width: 1024px) 160px, 40vw",
  priority,
}: {
  author: Pick<Author, "name" | "photo_url">;
  fallbackBook?: BookView;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = author.photo_url ?? fallbackBook?.cover_url ?? null;
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-full bg-paper-3 ${className}`}
      style={!author.photo_url && fallbackBook ? { backgroundColor: fallbackBook.cover_color } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={author.photo_url ? author.name : ""}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${author.photo_url ? "" : "scale-125 opacity-90 grayscale-[35%]"}`}
        />
      ) : (
        <span className="display absolute inset-0 flex items-center justify-center text-5xl text-muted">
          {author.name.charAt(0)}
        </span>
      )}
    </div>
  );
}
