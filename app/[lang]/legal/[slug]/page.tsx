import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, PageHeader, RichText } from "@/components/site/ui";
import { getPage } from "@/lib/data";
import { isLocale, LOCALES, pick, type RouteKey } from "@/lib/i18n";
import { excerpt, pageMeta } from "@/lib/seo";

const SLUGS = ["kvkk", "gizlilik", "cerez"] as const;
type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !SLUGS.includes(slug as (typeof SLUGS)[number])) return {};
  const page = await getPage(slug);
  if (!page) return {};
  return pageMeta({
    lang,
    key: `legal/${slug}` as RouteKey,
    title: pick(lang, page.title_tr, page.title_en),
    description: excerpt(pick(lang, page.body_tr, page.body_en)),
  });
}

export default function LegalPage({ params }: Props) {
  return (
    <Suspense fallback={<Container className="pt-16">{null}</Container>}>
      <LegalContent params={params} />
    </Suspense>
  );
}

async function LegalContent({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !SLUGS.includes(slug as (typeof SLUGS)[number])) notFound();
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <Container>
      <PageHeader title={pick(lang, page.title_tr, page.title_en)} />
      <RichText
        text={pick(lang, page.body_tr, page.body_en)}
        className="max-w-3xl border-t border-rule pt-10 text-lg leading-relaxed text-ink-2"
      />
    </Container>
  );
}
