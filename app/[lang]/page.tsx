import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BannerSlider, type Slide } from "@/components/site/banner-slider";
import { BookGrid, bookAuthors, bookTitle, Cover } from "@/components/site/book-card";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { ButtonLink, Container, SectionHeading } from "@/components/site/ui";
import { getCatalog } from "@/lib/data";
import { getDict, href, isLocale, pick, switchLocalePath } from "@/lib/i18n";
import { excerpt, pageMeta } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { settings } = await getCatalog();
  return pageMeta({ lang, description: excerpt(pick(lang, settings?.home_about_tr, settings?.home_about_en)) });
}

/** Panelde "/kitaplar?dizi=…" gibi TR yol girildiyse EN sayfada karşılığına çevirir. */
function localizeLink(url: string, lang: Locale) {
  if (!url.startsWith("/") || lang === "tr") return url;
  const [path, query] = url.split("?");
  return switchLocalePath(path, "en") + (query ? `?${query}` : "");
}

export default async function Home({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw;
  const t = getDict(lang);
  const c = await getCatalog();

  const slides: Slide[] = c.banners.slice(0, 4).map((b) => {
    const book = b.book_id ? c.books.find((x) => x.id === b.book_id) : undefined;
    return {
      id: b.id,
      title: pick(lang, b.title_tr, b.title_en),
      subtitle: pick(lang, b.subtitle_tr, b.subtitle_en),
      cta: pick(lang, b.cta_tr, b.cta_en),
      href: book ? href(lang, "books", book.slug) : b.link_url ? localizeLink(b.link_url, lang) : null,
      desktop: b.image_desktop_url,
      mobile: b.image_mobile_url,
      theme: b.text_theme,
    };
  });

  const newBooks = c.books.filter((b) => b.is_new || b.is_coming_soon);
  const releases = (newBooks.length ? newBooks : c.books).slice(0, 8);

  const featured = c.settings?.featured_book_id ? c.books.find((b) => b.id === c.settings!.featured_book_id) : undefined;
  const featuredText = featured
    ? pick(lang, c.settings?.featured_text_tr, c.settings?.featured_text_en) ||
      excerpt(pick(lang, featured.description_tr, featured.description_en), 320)
    : undefined;

  const seriesRows = c.series
    .map((s) => ({ s, books: c.books.filter((b) => b.series_id === s.id) }))
    .filter((r) => r.books.length);

  const featuredAuthors = c.authors.filter((a) => a.featured && a.bookIds.length).slice(0, 6);
  const about = pick(lang, c.settings?.home_about_tr, c.settings?.home_about_en);

  return (
    <>
      <h1 className="sr-only">{lang === "tr" ? "Muhtelif Kitap — bağımsız yayınevi" : "Muhtelif Kitap — independent publisher"}</h1>

      {slides.length > 0 && (
        <Container className="pt-6 sm:pt-8">
          <BannerSlider slides={slides} labels={{ prev: t.prev, next: t.next, slide: lang === "tr" ? "Duyuru" : "Announcement" }} />
        </Container>
      )}

      {/* Yeni çıkanlar */}
      <Container className="pt-20">
        <SectionHeading title={t.newReleases} href={href(lang, "books")} linkLabel={t.allBooks} />
        <BookGrid books={releases} lang={lang} />
        <div className="mt-12 flex justify-center">
          <ButtonLink href={href(lang, "books")} variant="outline">
            {t.allBooks} <span aria-hidden>→</span>
          </ButtonLink>
        </div>
      </Container>

      {/* Öne çıkan kitap */}
      {featured && (
        <section className="mt-24 bg-paper-2">
          <Container className="grid items-center gap-10 py-16 md:grid-cols-12 md:gap-16 md:py-20">
            <Link href={href(lang, "books", featured.slug)} className="group mx-auto w-full max-w-[340px] md:col-span-5 md:max-w-none lg:col-span-4 lg:col-start-2">
              <Cover book={featured} lang={lang} sizes="(min-width: 768px) 30vw, 80vw" />
            </Link>
            <div className="md:col-span-7 lg:col-span-6">
              <p className="label text-muted">{t.featured}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{bookTitle(lang, featured)}</h2>
              <p className="mt-2 text-xl text-ink-2">{bookAuthors(featured)}</p>
              {featuredText && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{featuredText}</p>}
              <div className="mt-8">
                <ButtonLink href={href(lang, "books", featured.slug)}>
                  {t.discover} <span aria-hidden>→</span>
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Diziler */}
      {seriesRows.length > 0 && (
        <Container className="pt-24">
          <SectionHeading title={t.series} />
          <div className="space-y-16">
            {seriesRows.map(({ s, books }) => (
              <div key={s.id} className="grid gap-6 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-3">
                  <h3 className="font-serif text-2xl font-medium">{pick(lang, s.name_tr, s.name_en)}</h3>
                  {pick(lang, s.description_tr, s.description_en) && (
                    <p className="mt-2 text-ink-2">{pick(lang, s.description_tr, s.description_en)}</p>
                  )}
                  <Link href={`${href(lang, "books")}?dizi=${s.slug}`} className="label mt-4 inline-block hover:underline underline-offset-4">
                    {t.allBooks} ({books.length}) <span aria-hidden>→</span>
                  </Link>
                </div>
                <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:gap-6 sm:px-8 lg:col-span-9 lg:mx-0 lg:px-0">
                  {books.map((b) => (
                    <li key={b.id} className="w-[38%] shrink-0 snap-start sm:w-[24%] lg:w-[18%]">
                      <Link href={href(lang, "books", b.slug)} className="group block" title={bookTitle(lang, b)}>
                        <Cover book={b} lang={lang} sizes="(min-width: 1024px) 14vw, 36vw" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* Yazarlarımız */}
      {featuredAuthors.length > 0 && (
        <Container className="pt-24">
          <SectionHeading title={t.ourAuthors} href={href(lang, "authors")} linkLabel={t.allAuthors} />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {featuredAuthors.map((a) => {
              const first = c.books.find((b) => a.bookIds.includes(b.id));
              return (
                <li key={a.id}>
                  <Link href={href(lang, "authors", a.slug)} className="group block text-center">
                    <AuthorAvatar author={a} fallbackBook={first} className="mx-auto w-full max-w-[160px]" />
                    <p className="mt-4 text-lg leading-tight group-hover:underline underline-offset-4">{a.name}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      )}

      {/* Kısa hakkımızda */}
      {about && (
        <Container className="pt-24">
          <div className="grid gap-8 border-t border-ink pt-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Image src="/brand/muhtelif-logo.png" alt="" width={951} height={564} className="h-20 w-auto" />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="font-serif text-2xl leading-snug sm:text-3xl">{about}</p>
              <Link href={href(lang, "about")} className="label mt-8 inline-block hover:underline underline-offset-4">
                {t.readMore} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Container>
      )}

      {c.books.length === 0 && (
        <Container className="py-24 text-center text-muted">{t.noBooks}</Container>
      )}
    </>
  );
}
