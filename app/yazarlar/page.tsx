import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAuthors } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Yazarlar",
  description: "Muhtelif Kitap yazarları, şairleri ve çevirmenleri.",
};

export default async function YazarlarPage() {
  const authors = await getAuthors();

  // Baş harfe göre grupla (Türkçe alfabe)
  const groups = new Map<string, typeof authors>();
  for (const a of authors) {
    const letter = a.name.charAt(0).toLocaleUpperCase("tr");
    groups.set(letter, [...(groups.get(letter) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <header className="pt-14 pb-12 sm:pt-20">
        <p className="label text-muted">{authors.length} isim</p>
        <h1 className="display mt-4 text-[clamp(4rem,12vw,11rem)]">Yazarlar</h1>
      </header>

      <div className="border-t border-ink">
        {[...groups.entries()].map(([letter, list]) => (
          <section key={letter} className="grid gap-4 border-b border-rule py-6 sm:grid-cols-[6rem_1fr]">
            <h2 className="display text-6xl text-muted/60" aria-label={`${letter} harfi`}>
              {letter}
            </h2>
            <ul className="divide-y divide-rule">
              {list.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/yazarlar/${a.slug}`}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span>
                      <span className="block font-serif text-3xl leading-tight group-hover:underline underline-offset-4 sm:text-4xl">
                        {a.name}
                      </span>
                      <span className="label mt-1 block text-muted">
                        {[...new Set(a.books.map((b) => CATEGORY_LABELS[b.category]))].join(" · ")} ·{" "}
                        {a.books.length} kitap
                      </span>
                    </span>
                    <span className="flex shrink-0 -space-x-6">
                      {a.books.map((b, i) => (
                        <span
                          key={b.slug}
                          className="book block w-14 transition-transform duration-500 group-hover:-translate-y-1 sm:w-16"
                          style={{ transform: `rotate(${(i - (a.books.length - 1) / 2) * 6}deg)`, zIndex: i }}
                        >
                          <Image
                            src={b.cover.src}
                            alt=""
                            width={b.cover.width}
                            height={b.cover.height}
                            sizes="64px"
                            className="aspect-[2/3] w-full object-cover"
                          />
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
