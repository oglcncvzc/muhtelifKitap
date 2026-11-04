import type { MetadataRoute } from "next";
import { getAuthors, getBooks } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, authors] = await Promise.all([getBooks(), getAuthors()]);
  const u = (p: string) => new URL(p, SITE.url).toString();
  return [
    { url: u("/"), priority: 1 },
    { url: u("/kitaplar"), priority: 0.9 },
    { url: u("/yazarlar"), priority: 0.7 },
    { url: u("/hakkimizda"), priority: 0.5 },
    { url: u("/iletisim"), priority: 0.5 },
    ...books.map((b) => ({ url: u(`/kitaplar/${b.slug}`), priority: 0.8 })),
    ...authors.map((a) => ({ url: u(`/yazarlar/${a.slug}`), priority: 0.6 })),
  ];
}
