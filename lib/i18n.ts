import type { Locale } from "@/lib/types";

export const LOCALES: Locale[] = ["tr", "en"];
export const DEFAULT_LOCALE: Locale = "tr";
export const isLocale = (v: string): v is Locale => (LOCALES as string[]).includes(v);

/**
 * İç rota (app/[lang]/<anahtar>) → dile göre herkese açık yol parçası.
 * TR kökte: /kitaplar  ·  EN /en altında: /en/books
 */
export const ROUTES = {
  books: { tr: "kitaplar", en: "books" },
  authors: { tr: "yazarlar", en: "authors" },
  about: { tr: "hakkimizda", en: "about" },
  contact: { tr: "iletisim", en: "contact" },
  "legal/kvkk": { tr: "kvkk", en: "kvkk" },
  "legal/gizlilik": { tr: "gizlilik-politikasi", en: "privacy-policy" },
  "legal/cerez": { tr: "cerez-politikasi", en: "cookie-policy" },
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Dile göre herkese açık bağlantı üretir. */
export function href(lang: Locale, key?: RouteKey, slug?: string): string {
  const prefix = lang === "en" ? "/en" : "";
  if (!key) return prefix || "/";
  return `${prefix}/${ROUTES[key][lang]}${slug ? `/${slug}` : ""}`;
}

type Parsed = { lang: Locale; key?: RouteKey; slug?: string; unknown?: boolean };

/** Herkese açık yolu çözer: /en/books/nis → { lang: "en", key: "books", slug: "nis" } */
export function parsePublicPath(pathname: string): Parsed {
  let lang: Locale = "tr";
  let rest = pathname;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    lang = "en";
    rest = pathname.slice(3);
  }
  const segs = rest.split("/").filter(Boolean);
  if (!segs.length) return { lang };
  const key = (Object.keys(ROUTES) as RouteKey[]).find((k) => ROUTES[k][lang] === segs[0]);
  if (!key) return { lang, unknown: true };
  return { lang, key, slug: segs.slice(1).join("/") || undefined };
}

/** Herkese açık yol → app/[lang] altındaki iç yol (proxy.ts rewrite için). */
export function toInternalPath(pathname: string): string {
  const { lang, key, slug, unknown } = parsePublicPath(pathname);
  if (unknown) return `/${lang}/__yok${pathname}`;
  if (!key) return `/${lang}`;
  return `/${lang}/${key}${slug ? `/${slug}` : ""}`;
}

/** Aynı sayfanın diğer dildeki adresi (dil seçici ve hreflang için). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const { key, slug, unknown } = parsePublicPath(pathname);
  if (unknown) return href(target);
  return href(target, key, slug);
}

/** TR/EN alan seçimi; EN boşsa TR'ye düşer. */
export function pick(lang: Locale, tr: string | null | undefined, en: string | null | undefined): string {
  return (lang === "en" ? en || tr : tr || en) ?? "";
}

export const DICT = {
  tr: {
    nav: { books: "Kitaplar", authors: "Yazarlar", about: "Hakkımızda", contact: "İletişim", search: "Ara" },
    skip: "İçeriğe geç",
    menu: "Menü",
    close: "Kapat",
    newReleases: "Yeni Çıkanlar",
    allBooks: "Tüm Kitaplar",
    featured: "Öne Çıkan",
    discover: "Kitabı incele",
    series: "Diziler",
    ourAuthors: "Yazarlarımız",
    allAuthors: "Tüm Yazarlar",
    readMore: "Devamını Oku",
    badgeNew: "Yeni",
    badgeSoon: "Yakında",
    searchPlaceholder: "Kitap veya yazar ara…",
    searchEmpty: "Sonuç bulunamadı.",
    results: (n: number) => `${n} kitap`,
    all: "Tümü",
    genre: "Tür",
    serie: "Dizi",
    imprint: "Yayınevi",
    clearFilters: "Filtreleri temizle",
    buy: "Satın Al",
    whereToBuy: "Satış noktaları",
    sample: "Tadımlık okuma (PDF)",
    otherByAuthor: "Yazarın diğer kitapları",
    related: "Benzer kitaplar",
    prev: "Önceki",
    next: "Sonraki",
    booksBy: "Kitapları",
    facts: {
      author: "Yazar",
      genre: "Tür",
      series: "Dizi",
      imprint: "Yayınevi",
      isbn: "ISBN",
      pages: "Sayfa",
      date: "Basım tarihi",
      edition: "Baskı",
      size: "Ebat",
      language: "Dil",
      editor: "Editör",
      translator: "Çevirmen",
      coverDesigner: "Kapak tasarımı",
      other: "Künye",
    },
    contactInfo: { address: "Adres", phone: "Telefon", email: "E-posta", social: "Sosyal medya", map: "Harita", submission: "Dosya gönderimi" },
    form: {
      subject: "Konu",
      subjects: { genel: "Genel", dosya: "Dosya gönderimi", basin: "Basın", satis: "Satış & dağıtım" },
      name: "Ad Soyad",
      namePh: "Adınız",
      email: "E-posta",
      emailPh: "ornek@eposta.com",
      message: "Mesaj",
      messagePh: "Bize ne söylemek istersiniz?",
      send: "Gönder",
      sending: "Gönderiliyor…",
      thanksTitle: "Teşekkürler",
      thanks: "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.",
      errName: "Adınızı yazın.",
      errEmail: "Geçerli bir e-posta adresi yazın.",
      errMessage: "Mesajınız en az 10 karakter olmalı.",
      errSend: "Mesajınız gönderilemedi. Lütfen tekrar deneyin.",
      kvkk: "Gönderdiğiniz bilgiler KVKK Aydınlatma Metni kapsamında işlenir.",
    },
    footer: { legal: "Yasal", kvkk: "KVKK", privacy: "Gizlilik Politikası", cookies: "Çerez Politikası", rights: "Tüm hakları saklıdır." },
    notFound: { title: "Bu sayfa rafta yok", text: "Aradığınız sayfa taşınmış ya da hiç basılmamış olabilir.", back: "Kitaplara dön" },
    noBooks: "Henüz kitap eklenmedi.",
  },
  en: {
    nav: { books: "Books", authors: "Authors", about: "About", contact: "Contact", search: "Search" },
    skip: "Skip to content",
    menu: "Menu",
    close: "Close",
    newReleases: "New Releases",
    allBooks: "All Books",
    featured: "Featured",
    discover: "View book",
    series: "Series",
    ourAuthors: "Our Authors",
    allAuthors: "All Authors",
    readMore: "Read More",
    badgeNew: "New",
    badgeSoon: "Coming Soon",
    searchPlaceholder: "Search books or authors…",
    searchEmpty: "No results.",
    results: (n: number) => `${n} ${n === 1 ? "book" : "books"}`,
    all: "All",
    genre: "Genre",
    serie: "Series",
    imprint: "Imprint",
    clearFilters: "Clear filters",
    buy: "Buy",
    whereToBuy: "Where to buy",
    sample: "Read a sample (PDF)",
    otherByAuthor: "More by this author",
    related: "You may also like",
    prev: "Previous",
    next: "Next",
    booksBy: "Books",
    facts: {
      author: "Author",
      genre: "Genre",
      series: "Series",
      imprint: "Imprint",
      isbn: "ISBN",
      pages: "Pages",
      date: "Publication date",
      edition: "Edition",
      size: "Format",
      language: "Language",
      editor: "Editor",
      translator: "Translator",
      coverDesigner: "Cover design",
      other: "Credits",
    },
    contactInfo: { address: "Address", phone: "Phone", email: "Email", social: "Social media", map: "Map", submission: "Manuscript submissions" },
    form: {
      subject: "Subject",
      subjects: { genel: "General", dosya: "Manuscript submission", basin: "Press", satis: "Sales & distribution" },
      name: "Full name",
      namePh: "Your name",
      email: "Email",
      emailPh: "you@example.com",
      message: "Message",
      messagePh: "What would you like to tell us?",
      send: "Send",
      sending: "Sending…",
      thanksTitle: "Thank you",
      thanks: "Your message has reached us. We will get back to you shortly.",
      errName: "Please enter your name.",
      errEmail: "Please enter a valid email address.",
      errMessage: "Your message must be at least 10 characters.",
      errSend: "Your message could not be sent. Please try again.",
      kvkk: "Your information is processed in accordance with our Personal Data Notice.",
    },
    footer: { legal: "Legal", kvkk: "Personal Data Notice", privacy: "Privacy Policy", cookies: "Cookie Policy", rights: "All rights reserved." },
    notFound: { title: "Not on our shelves", text: "The page you are looking for may have moved or never been printed.", back: "Back to books" },
    noBooks: "No books yet.",
  },
} as const;

export type Dict = (typeof DICT)["tr"];
export const getDict = (lang: Locale): Dict => DICT[lang] as unknown as Dict;
