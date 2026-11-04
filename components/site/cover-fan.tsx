import Link from "next/link";
import { bookTitle, Cover } from "@/components/site/book-card";
import { href } from "@/lib/i18n";
import type { BookView, Locale } from "@/lib/types";

/**
 * Öne çıkan kitap önde, yanında aynı diziden/türden kitaplar arkada yelpaze gibi.
 * Kaydırdıkça kapaklar üst üste dururken açılır (CSS scroll-driven; desteklemeyen
 * tarayıcıda doğrudan açık hâlde görünür). Üstüne gelinen kapak yükselir.
 */
export function CoverFan({ featured, companions, lang }: { featured: BookView; companions: BookView[]; lang: Locale }) {
  const left = companions[0];
  const right = companions[1];
  const items = [
    left && { book: left, tx: "-46%", ty: "5%", rot: "-8deg", z: 10, w: "50%" },
    right && { book: right, tx: "46%", ty: "5%", rot: "8deg", z: 10, w: "50%" },
    { book: featured, tx: "0%", ty: "0%", rot: "0deg", z: 20, w: "58%" },
  ].filter(Boolean) as { book: BookView; tx: string; ty: string; rot: string; z: number; w: string }[];

  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-[560px]">
      {items.map(({ book, tx, ty, rot, z, w }) => (
        <Link
          key={book.id}
          href={href(lang, "books", book.slug)}
          title={bookTitle(lang, book)}
          tabIndex={book.id === featured.id ? undefined : -1}
          className="fan-card group absolute top-1/2 left-1/2 hover:z-30 focus-visible:z-30"
          style={{ "--tx": tx, "--ty": ty, "--rot": rot, zIndex: z, width: w } as React.CSSProperties}
        >
          <Cover book={book} lang={lang} sizes="(min-width: 768px) 22vw, 50vw" />
        </Link>
      ))}
    </div>
  );
}
