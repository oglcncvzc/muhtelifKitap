import type { Metadata } from "next";
import { Suspense } from "react";
import { getBooks } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog-browser";
import { BookCard } from "@/components/book-card";

export const metadata: Metadata = {
  title: "Kitaplar",
  description: "Muhtelif Kitap kataloğu: roman, öykü, şiir, inceleme ve Muhtelif Spekülatif dizisi.",
};

export default async function KitaplarPage() {
  const books = await getBooks();
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <header className="pt-14 pb-10 sm:pt-20">
        <p className="label text-muted">Katalog</p>
        <h1 className="display mt-4 text-[clamp(4rem,12vw,11rem)]">Kitaplar</h1>
      </header>
      <Suspense
        fallback={
          <ul className="mt-24 grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((b) => (
              <li key={b.slug}>
                <BookCard book={b} />
              </li>
            ))}
          </ul>
        }
      >
        <CatalogBrowser books={books} />
      </Suspense>
    </div>
  );
}
