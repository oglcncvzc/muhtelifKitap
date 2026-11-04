import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookGrid } from "@/components/site/book-card";
import { CatalogBrowser } from "@/components/site/catalog-browser";
import { Container, PageHeader } from "@/components/site/ui";
import { getCatalog } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return pageMeta({
    lang,
    key: "books",
    title: t.nav.books,
    description:
      lang === "tr"
        ? "Muhtelif Kitap kataloğu: roman, öykü, şiir, inceleme; Muhtelif Şiir ve Muhtelif Spekülatif dizileri."
        : "The Muhtelif Kitap catalogue: novels, short stories, poetry and non-fiction, including the Muhtelif Poetry and Muhtelif Speculative series.",
  });
}

export default async function BooksPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const c = await getCatalog();

  return (
    <Container>
      <PageHeader title={t.nav.books} />
      {/* Filtreler URL'den okunur; sunucu tarafında tüm katalog yedek olarak basılır */}
      <Suspense fallback={<BookGrid books={c.books} lang={lang} eager={4} />}>
        <CatalogBrowser lang={lang} books={c.books} categories={c.categories} series={c.series} imprints={c.imprints} />
      </Suspense>
    </Container>
  );
}
