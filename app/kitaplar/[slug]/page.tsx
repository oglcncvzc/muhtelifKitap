import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBook, getBooks } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/types";
import { BookCover } from "@/components/book-card";
import { SectionHeading, Shelf } from "@/components/shelf";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return {};
  const title = `${book.title} — ${book.author.name}`;
  return {
    title,
    description:
      book.description?.slice(0, 160) ??
      `${book.author.name} imzalı ${CATEGORY_LABELS[book.category].toLocaleLowerCase("tr")} kitabı ${book.title}, ${book.imprint} yayınları arasında.`,
    openGraph: { title, images: [{ url: book.cover.src, width: book.cover.width, height: book.cover.height }] },
  };
}

export default function BookPage({ params }: Props) {
  return (
    <Suspense fallback={<BookSkeleton />}>
      <BookContent params={params} />
    </Suspense>
  );
}

function BookSkeleton() {
  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-16 pb-20 sm:px-8 lg:grid-cols-12" aria-busy>
      <div className="mx-auto aspect-[2/3] w-full max-w-[460px] animate-pulse bg-paper-2 lg:col-span-5" />
      <div className="space-y-6 lg:col-span-7">
        <div className="h-4 w-40 animate-pulse bg-paper-2" />
        <div className="h-20 w-3/4 animate-pulse bg-paper-2" />
        <div className="h-10 w-1/3 animate-pulse bg-paper-2" />
      </div>
    </div>
  );
}

async function BookContent({ params }: Props) {
  const { slug } = await params;
  const [book, all] = await Promise.all([getBook(slug), getBooks()]);
  if (!book) notFound();

  const byAuthor = all.filter((b) => b.author.slug === book.author.slug && b.slug !== book.slug);
  const related = all
    .filter(
      (b) =>
        b.slug !== book.slug &&
        b.author.slug !== book.author.slug &&
        (book.series ? b.series === book.series : b.category === book.category),
    )
    .slice(0, 4);

  const idx = all.findIndex((b) => b.slug === book.slug);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const facts: [string, React.ReactNode][] = (
    [
      ["Yazar", <Link key="a" href={`/yazarlar/${book.author.slug}`} className="underline decoration-rule underline-offset-4 hover:decoration-ink">{book.author.name}</Link>],
      ["Tür", CATEGORY_LABELS[book.category]],
      ["Dizi", book.series],
      ["Yayınevi", book.imprint],
      ["Çeviri", book.translator],
      ["Editör", book.editor],
      ["Kapak", book.coverArtist],
      ["Baskı", book.edition],
      ["Dil", book.language],
      ["Sayfa", book.pages],
      ["Yıl", book.publishedYear],
      ["ISBN", book.isbn],
    ] as [string, React.ReactNode][]
  ).filter(([, v]) => v !== null && v !== undefined && v !== "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    alternativeHeadline: book.subtitle ?? undefined,
    author: { "@type": "Person", name: book.author.name },
    translator: book.translator ? { "@type": "Person", name: book.translator } : undefined,
    genre: CATEGORY_LABELS[book.category],
    inLanguage: book.language,
    isbn: book.isbn ?? undefined,
    numberOfPages: book.pages ?? undefined,
    image: new URL(book.cover.src, SITE.url).toString(),
    publisher: { "@type": "Organization", name: book.imprint },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div
        className="border-b border-rule"
        style={{ background: `color-mix(in oklab, ${book.cover.color} 16%, var(--paper))` }}
      >
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-8">
          <nav aria-label="İçerik yolu" className="label text-muted">
            <Link href="/kitaplar" className="hover:text-ink">Kitaplar</Link>
            <span aria-hidden className="px-2">/</span>
            <Link href={`/kitaplar?tur=${book.category}`} className="hover:text-ink">
              {CATEGORY_LABELS[book.category]}
            </Link>
          </nav>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-10 pb-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:pt-14">
          <div className="lg:col-span-5">
            <div className="rise mx-auto max-w-[300px] sm:max-w-[380px] lg:max-w-[460px] lg:sticky lg:top-28">
              <BookCover book={book} priority sizes="(min-width: 1024px) 460px, 90vw" />
            </div>
          </div>

          <div className="rise lg:col-span-7" style={{ animationDelay: "120ms" }}>
            <p className="label text-muted">
              {book.series ?? CATEGORY_LABELS[book.category]}
              {book.edition ? ` · ${book.edition}` : ""}
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] font-normal tracking-tight text-balance">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="mt-4 font-serif text-2xl italic text-ink-2 sm:text-3xl">{book.subtitle}</p>
            )}
            <p className="mt-6 text-xl">
              <Link href={`/yazarlar/${book.author.slug}`} className="display text-4xl hover:underline decoration-1 underline-offset-4">
                {book.author.name}
              </Link>
            </p>

            {book.description && (
              <div className="mt-10 max-w-2xl space-y-5 text-xl leading-relaxed text-ink-2 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8]">
                {book.description.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            <dl className="mt-12 grid max-w-2xl grid-cols-[8rem_1fr] border-t border-ink">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="label border-b border-rule py-4 text-muted">{k}</dt>
                  <dd className="border-b border-rule py-3.5 text-lg">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              {book.buyUrl ? (
                <a
                  href={book.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label inline-flex h-12 items-center gap-3 bg-ink px-6 text-paper hover:bg-ink-2"
                >
                  Satın al <span aria-hidden>↗</span>
                </a>
              ) : null}
              {typeof book.price === "number" && (
                <span className="display text-4xl">
                  {book.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {byAuthor.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-8">
          <SectionHeading title="Yazarın diğer kitapları" href={`/yazarlar/${book.author.slug}`} linkLabel="Yazar sayfası" />
          <Shelf books={byAuthor} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-8">
          <SectionHeading
            title={book.series ? "Diziden" : `Diğer ${CATEGORY_LABELS[book.category].toLocaleLowerCase("tr")} kitapları`}
            href={book.series ? "/kitaplar?dizi=spekulatif" : `/kitaplar?tur=${book.category}`}
          />
          <Shelf books={related} />
        </section>
      )}

      <nav aria-label="Önceki ve sonraki kitap" className="mx-auto mt-24 grid max-w-[1400px] grid-cols-2 border-y border-ink px-4 sm:px-8">
        <Link href={`/kitaplar/${prev.slug}`} className="group border-r border-rule py-8 pr-4">
          <span className="label text-muted">← Önceki</span>
          <span className="mt-2 block font-serif text-2xl group-hover:underline underline-offset-4 sm:text-3xl">{prev.title}</span>
        </Link>
        <Link href={`/kitaplar/${next.slug}`} className="group py-8 pl-4 text-right">
          <span className="label text-muted">Sonraki →</span>
          <span className="mt-2 block font-serif text-2xl group-hover:underline underline-offset-4 sm:text-3xl">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
}
