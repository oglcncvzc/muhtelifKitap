import type { Metadata } from "next";
import { href, type RouteKey } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";
export const SITE_NAME = "Muhtelif Kitap";

export const absUrl = (path: string) => new URL(path, SITE_URL).toString();

/** canonical + hreflang (tr, en, x-default) */
export function alternates(lang: Locale, key?: RouteKey, slug?: string): Metadata["alternates"] {
  return {
    canonical: absUrl(href(lang, key, slug)),
    languages: {
      tr: absUrl(href("tr", key, slug)),
      en: absUrl(href("en", key, slug)),
      "x-default": absUrl(href("tr", key, slug)),
    },
  };
}

export function pageMeta(opts: {
  lang: Locale;
  title?: string;
  description?: string;
  key?: RouteKey;
  slug?: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
}): Metadata {
  const { lang, title, description, key, slug, image } = opts;
  return {
    title,
    description,
    alternates: alternates(lang, key, slug),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: lang === "tr" ? "tr_TR" : "en_US",
      alternateLocale: lang === "tr" ? ["en_US"] : ["tr_TR"],
      url: absUrl(href(lang, key, slug)),
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

/** Düz metinden ~160 karakterlik açıklama */
export const excerpt = (text: string | null | undefined, max = 160) => {
  if (!text) return undefined;
  const clean = text.replace(/^##\s+/gm, "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : clean;
};
