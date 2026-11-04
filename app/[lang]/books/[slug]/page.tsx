import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badges, BookGrid, bookAuthors, bookTitle, Cover } from "@/components/site/book-card";
import { Container, RichText, SectionHeading } from "@/components/site/ui";
import { getBookBySlug, getCatalog } from "@/lib/data";
import { getDict, href, isLocale, LOCALES, pick } from "@/lib/i18n";
import { absUrl, excerpt, pageMeta } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const { books } = await getCatalog();
  return LOCALES.flatMap((lang) => books.map((b) => ({ lang, slug: b.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const book = await getBookBySlug(slug);
  if (!book) return {};
  const title = pick(lang, book.seo_title_tr, book.seo_title_en) || `${bookTitle(lang, book)} — ${bookAuthors(book)}`;
  const description =
    pick(lang, book.seo_description_tr, book.seo_description_en) ||
    excerpt(pick(lang, book.description_tr, book.description_en)) ||
    (lang === "tr"
      ? `${bookAuthors(book)} imzalı ${bookTitle(lang, book)}, Muhtelif Kitap yayınları arasında.`
      : `${bookTitle(lang, book)} by ${bookAuthors(book)}, published by Muhtelif Kitap.`);
  return pageMeta({
    lang,
    key: "books",
    slug,
    title,
    description,
    image: book.cover_url
      ? { url: book.cover_url, width: book.cover_width, height: book.cover_height, alt: bookTitle(lang, book) }
      : undefined,
  });
}

export default function BookPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <BookContent params={params} />
    </Suspense>
  );
}

function Skeleton() {
  return (
    <Container className="grid gap-12 pt-12 md:grid-cols-12" aria-busy>
      <div className="aspect-[2/3] animate-pulse bg-paper-2 md:col-span-5" />
      <div className="space-y-4 md:col-span-7">
        <div className="h-14 w-3/4 animate-pulse bg-paper-2" />
        <div className="h-6 w-1/3 animate-pulse bg-paper-2" />
      </div>
    </Container>
  );
}

const formatDate = (iso: string, lang: Locale) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", { year: "numeric", month: "long" });

async function BookContent({ params }: Props) {
  const { lang: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw;
  const t = getDict(lang);
  const c = await getCatalog();
  const book = c.books.find((b) => b.slug === slug);
  if (!book) notFound();

  const title = bookTitle(lang, book);
  const subtitle = pick(lang, book.subtitle, book.subtitle_en);
  const description = pick(lang, book.description_tr, book.description_en);
  const genre = book.category ? pick(lang, book.category.name_tr, book.category.name_en) : null;
  const seriesName = book.series ? pick(lang, book.series.name_tr, book.series.name_en) : null;

  const facts: [string, React.ReactNode][] = (
    [
      [
        t.facts.author,
        book.authors.map((a, i) => (
          <span key={a.id}>
            {i > 0 && ", "}
            <Link href={href(lang, "authors", a.slug)} className="underline decoration-rule underline-offset-4 hover:decoration-ink">
              {a.name}
            </Link>
          </span>
        )),
      ],
      [t.facts.genre, genre],
      [t.facts.series, seriesName && book.series ? <Link href={`${href(lang, "books")}?dizi=${book.series.slug}`} className="underline decoration-rule underline-offset-4 hover:decoration-ink">{seriesName}</Link> : null],
      [t.facts.imprint, book.imprint?.name],
      [t.facts.translator, book.translator],
      [t.facts.editor, book.editor],
      [t.facts.coverDesigner, book.cover_designer],
      [t.facts.other, book.other_credits],
      [t.facts.isbn, book.isbn],
      [t.facts.pages, book.pages],
      [t.facts.date, book.publish_date ? formatDate(book.publish_date, lang) : null],
      [t.facts.edition, book.edition],
      [t.facts.size, book.size],
      [t.facts.language, book.language],
    ] as [string, React.ReactNode][]
  ).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length));

  const authorIds = new Set(book.authors.map((a) => a.id));
  const byAuthor = c.books.filter((b) => b.id !== book.id && b.authors.some((a) => authorIds.has(a.id)));
  const related = c.books
    .filter(
      (b) =>
        b.id !== book.id &&
        !byAuthor.includes(b) &&
        (book.series_id ? b.series_id === book.series_id : b.category_id === book.category_id),
    )
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: title,
    alternativeHeadline: subtitle || undefined,
    author: book.authors.map((a) => ({ "@type": "Person", name: a.name, url: absUrl(href(lang, "authors", a.slug)) })),
    translator: book.translator ? { "@type": "Person", name: book.translator } : undefined,
    editor: book.editor ? { "@type": "Person", name: book.editor } : undefined,
    genre: genre ?? undefined,
    isbn: book.isbn ?? undefined,
    numberOfPages: book.pages ?? undefined,
    datePublished: book.publish_date ?? undefined,
    bookEdition: book.edition ?? undefined,
    inLanguage: book.language ?? undefined,
    image: book.cover_url ?? undefined,
    description: excerpt(description, 500),
    url: absUrl(href(lang, "books", book.slug)),
    publisher: { "@type": "Organization", name: book.imprint?.name ?? "Muhtelif Kitap" },
    isPartOf: seriesName ? { "@type": "BookSeries", name: seriesName } : undefined,
    offers: book.links.length
      ? book.links.map((l) => ({ "@type": "Offer", url: l.url, seller: { "@type": "Organization", name: l.store.name } }))
      : undefined,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container>
        <nav aria-label={lang === "tr" ? "İçerik yolu" : "Breadcrumb"} className="label pt-8 text-muted">
          <Link href={href(lang, "books")} className="hover:text-ink">{t.nav.books}</Link>
          {genre && book.category && (
            <>
              <span aria-hidden className="px-2">/</span>
              <Link href={`${href(lang, "books")}?tur=${book.category.slug}`} className="hover:text-ink">{genre}</Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 pt-8 md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="md:col-span-5">
            <div className="relative mx-auto max-w-[360px] md:sticky md:top-28 md:max-w-none">
              <Badges book={book} lang={lang} />
              <Cover book={book} lang={lang} priority sizes="(min-width: 768px) 38vw, 90vw" />
            </div>
          </div>

          <div className="md:col-span-7">
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] font-normal tracking-tight text-balance">{title}</h1>
            {subtitle && <p className="mt-3 font-serif text-2xl text-ink-2 italic">{subtitle}</p>}
            <p className="mt-5 text-xl">
              {book.authors.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && ", "}
                  <Link href={href(lang, "authors", a.slug)} className="hover:underline underline-offset-4">{a.name}</Link>
                </span>
              ))}
            </p>

            {(book.links.length > 0 || book.sample_url) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {book.links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label inline-flex h-11 items-center gap-2 bg-ink px-5 text-paper hover:bg-ink-2"
                  >
                    {t.buy} · {l.store.name} <span aria-hidden>↗</span>
                    <span className="sr-only">{lang === "tr" ? "(yeni sekmede açılır)" : "(opens in a new tab)"}</span>
                  </a>
                ))}
                {book.sample_url && (
                  <a
                    href={book.sample_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label inline-flex h-11 items-center gap-2 border border-ink px-5 hover:bg-ink hover:text-paper"
                  >
                    {t.sample} <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            )}

            {description && <RichText text={description} className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl" />}

            <dl className="mt-12 grid max-w-2xl grid-cols-[minmax(7rem,10rem)_1fr] border-t border-ink">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="label border-b border-rule py-3.5 text-muted">{k}</dt>
                  <dd className="border-b border-rule py-3 text-[17px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      {byAuthor.length > 0 && (
        <Container className="pt-24">
          <SectionHeading title={t.otherByAuthor} />
          <BookGrid books={byAuthor.slice(0, 4)} lang={lang} />
        </Container>
      )}
      {related.length > 0 && (
        <Container className="pt-24">
          <SectionHeading title={t.related} />
          <BookGrid books={related} lang={lang} />
        </Container>
      )}
    </article>
  );
}
