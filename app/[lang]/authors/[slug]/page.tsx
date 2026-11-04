import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { BookGrid } from "@/components/site/book-card";
import { Container, RichText, SectionHeading } from "@/components/site/ui";
import { getAuthorBySlug, getCatalog } from "@/lib/data";
import { getDict, href, isLocale, LOCALES, pick } from "@/lib/i18n";
import { absUrl, excerpt, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const { authors } = await getCatalog();
  return LOCALES.flatMap((lang) => authors.filter((a) => a.bookIds.length).map((a) => ({ lang, slug: a.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const a = await getAuthorBySlug(slug);
  if (!a) return {};
  const titles = a.books.map((b) => (lang === "en" ? b.title_en || b.title : b.title)).join(", ");
  return pageMeta({
    lang,
    key: "authors",
    slug,
    title: a.name,
    description:
      excerpt(pick(lang, a.bio_tr, a.bio_en)) ??
      (lang === "tr" ? `${a.name} — Muhtelif Kitap'tan çıkan kitapları: ${titles}.` : `${a.name} — books published by Muhtelif Kitap: ${titles}.`),
    image: a.photo_url ? { url: a.photo_url, alt: a.name } : a.books[0]?.cover_url ? { url: a.books[0].cover_url } : undefined,
  });
}

export default function AuthorPage({ params }: Props) {
  return (
    <Suspense fallback={<Container className="pt-16"><div className="h-40 w-40 animate-pulse rounded-full bg-paper-2" aria-busy /></Container>}>
      <AuthorContent params={params} />
    </Suspense>
  );
}

const LINKS = [
  ["website", "Web"],
  ["instagram", "Instagram"],
  ["x", "X"],
  ["facebook", "Facebook"],
] as const;

async function AuthorContent({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const a = await getAuthorBySlug(slug);
  if (!a || !a.books.length) notFound();
  const bio = pick(lang, a.bio_tr, a.bio_en);
  const links = LINKS.filter(([k]) => a[k]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    image: a.photo_url ?? undefined,
    description: excerpt(bio, 300),
    url: absUrl(href(lang, "authors", a.slug)),
    sameAs: links.map(([k]) => a[k]).filter(Boolean),
  };

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label={lang === "tr" ? "İçerik yolu" : "Breadcrumb"} className="label pt-8 text-muted">
        <Link href={href(lang, "authors")} className="hover:text-ink">{t.nav.authors}</Link>
      </nav>

      <header className="grid gap-10 pt-8 pb-4 md:grid-cols-12 md:items-start">
        <div className="md:col-span-3">
          <AuthorAvatar author={a} fallbackBook={a.books[0]} priority className="mx-auto w-48 md:w-full" sizes="(min-width: 768px) 22vw, 192px" />
        </div>
        <div className="md:col-span-8 md:col-start-5">
          <h1 className="display text-[clamp(3rem,7vw,5.5rem)]">{a.name}</h1>
          {bio && <RichText text={bio} className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl" />}
          {links.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {links.map(([k, label]) => (
                <li key={k}>
                  <a href={a[k]!} target="_blank" rel="noopener noreferrer" className="label hover:underline underline-offset-4">
                    {label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <section className="pt-16">
        <SectionHeading title={t.booksBy} />
        <BookGrid books={a.books} lang={lang} eager={4} />
      </section>
    </Container>
  );
}
