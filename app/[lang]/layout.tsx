import type { Metadata, Viewport } from "next";
import { Big_Shoulders, JetBrains_Mono, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { Header, type SearchItem } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getCatalog } from "@/lib/data";
import { getDict, isLocale, LOCALES } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import "../globals.css";

const display = Big_Shoulders({ variable: "--font-big-shoulders", subsets: ["latin", "latin-ext"], axes: ["opsz"] });
const serif = Newsreader({ variable: "--font-newsreader", subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "latin-ext"] });


export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const tr = lang !== "en";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: tr ? `${SITE_NAME} — Roman, öykü, şiir` : `${SITE_NAME} — Independent publisher`,
      template: `%s · ${SITE_NAME}`,
    },
    description: tr
      ? "Muhtelif Kitap; roman, öykü, şiir ve inceleme yayımlayan bağımsız yayınevi."
      : "Muhtelif Kitap is an independent Turkish publisher of novels, short stories, poetry and non-fiction.",
  };
}

export const viewport: Viewport = { themeColor: "#f7f6f2" };

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang: raw } = (await params) as { lang: string };
  if (!isLocale(raw)) notFound();
  const lang: Locale = raw;
  const t = getDict(lang);
  const [catalog, year] = await Promise.all([getCatalog(), currentYear()]);

  const index: SearchItem[] = [
    ...catalog.books.map((b) => ({
      type: "book" as const,
      slug: b.slug,
      title: lang === "en" ? b.title_en || b.title : b.title,
      sub: b.authors.map((a) => a.name).join(", "),
      cover: b.cover_url,
      color: b.cover_color,
    })),
    ...catalog.authors
      .filter((a) => a.bookIds.length)
      .map((a) => ({ type: "author" as const, slug: a.slug, title: a.name, sub: t.nav.authors })),
  ];

  return (
    <html lang={lang} className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#icerik"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          {t.skip}
        </a>
        <Header lang={lang} index={index} />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} settings={catalog.settings} year={year} />
      </body>
    </html>
  );
}
