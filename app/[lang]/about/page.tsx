import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink, Container, PageHeader, RichText } from "@/components/site/ui";
import { getPage } from "@/lib/data";
import { getDict, href, isLocale, pick } from "@/lib/i18n";
import { excerpt, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await getPage("hakkimizda");
  return pageMeta({
    lang,
    key: "about",
    title: page ? pick(lang, page.title_tr, page.title_en) : getDict(lang).nav.about,
    description: excerpt(page ? pick(lang, page.body_tr, page.body_en) : null),
  });
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const page = await getPage("hakkimizda");

  return (
    <Container>
      <PageHeader title={page ? pick(lang, page.title_tr, page.title_en) : t.nav.about} />
      <div className="grid gap-12 border-t border-rule pt-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Image src="/brand/muhtelif-logo.png" alt="Muhtelif Kitap" width={951} height={564} className="h-24 w-auto" />
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <RichText
            text={page ? pick(lang, page.body_tr, page.body_en) : ""}
            className="text-lg leading-relaxed text-ink-2 sm:text-xl [&>p:first-child]:font-serif [&>p:first-child]:text-2xl [&>p:first-child]:leading-snug [&>p:first-child]:text-ink sm:[&>p:first-child]:text-3xl"
          />
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={href(lang, "books")}>
              {t.allBooks} <span aria-hidden>→</span>
            </ButtonLink>
            <ButtonLink href={href(lang, "contact")} variant="outline">
              {t.nav.contact}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
