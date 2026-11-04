import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Container, PageHeader } from "@/components/site/ui";
import { getCatalog } from "@/lib/data";
import { getDict, href, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMeta({
    lang,
    key: "authors",
    title: getDict(lang).nav.authors,
    description: lang === "tr" ? "Muhtelif Kitap yazarları, şairleri ve çevirmenleri." : "Authors and poets published by Muhtelif Kitap.",
  });
}

export default async function AuthorsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const c = await getCatalog();
  const authors = c.authors
    .filter((a) => a.bookIds.length)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <Container>
      <PageHeader title={t.nav.authors} />
      <ul className="grid grid-cols-2 gap-x-5 gap-y-12 border-t border-rule pt-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
        {authors.map((a, i) => {
          const books = c.books.filter((b) => a.bookIds.includes(b.id));
          return (
            <li key={a.id}>
              <Link href={href(lang, "authors", a.slug)} className="group block">
                <AuthorAvatar author={a} fallbackBook={books[0]} priority={i < 5} sizes="(min-width: 1024px) 18vw, 45vw" />
                <p className="mt-4 text-lg leading-tight font-medium group-hover:underline underline-offset-4">{a.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {books.map((b) => (lang === "en" ? b.title_en || b.title : b.title)).join(" · ")}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
