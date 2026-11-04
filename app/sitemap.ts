import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data";
import { href, type RouteKey } from "@/lib/i18n";
import { absUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getCatalog();

  const entry = (key: RouteKey | undefined, slug: string | undefined, priority: number, lastModified?: string) => ({
    url: absUrl(href("tr", key, slug)),
    lastModified,
    priority,
    alternates: { languages: { tr: absUrl(href("tr", key, slug)), en: absUrl(href("en", key, slug)) } },
  });

  return [
    entry(undefined, undefined, 1),
    entry("books", undefined, 0.9),
    entry("authors", undefined, 0.7),
    entry("about", undefined, 0.5),
    entry("contact", undefined, 0.5),
    ...c.books.map((b) => entry("books", b.slug, 0.8, b.updated_at)),
    ...c.authors.filter((a) => a.bookIds.length).map((a) => entry("authors", a.slug, 0.6)),
    entry("legal/kvkk", undefined, 0.2),
    entry("legal/gizlilik", undefined, 0.2),
    entry("legal/cerez", undefined, 0.2),
  ];
}
