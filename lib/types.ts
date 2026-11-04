/** Supabase tablolarının satır tipleri (v2 şeması). */

export type Locale = "tr" | "en";

export type Imprint = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
};

export type Category = {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  sort_order: number;
};

export type Series = {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  description_tr: string | null;
  description_en: string | null;
  sort_order: number;
};

export type Store = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  photo_url: string | null;
  bio_tr: string | null;
  bio_en: string | null;
  website: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
  featured: boolean;
  sort_order: number;
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  category_id: string | null;
  series_id: string | null;
  imprint_id: string | null;
  description_tr: string | null;
  description_en: string | null;
  isbn: string | null;
  pages: number | null;
  publish_date: string | null;
  edition: string | null;
  size: string | null;
  language: string | null;
  editor: string | null;
  translator: string | null;
  cover_designer: string | null;
  other_credits: string | null;
  sample_url: string | null;
  cover_url: string | null;
  cover_width: number;
  cover_height: number;
  cover_color: string;
  is_new: boolean;
  is_coming_soon: boolean;
  is_published: boolean;
  sort_order: number;
  seo_title_tr: string | null;
  seo_title_en: string | null;
  seo_description_tr: string | null;
  seo_description_en: string | null;
  updated_at: string;
};

export type BookAuthor = { book_id: string; author_id: string; position: number };

export type BookLink = {
  id: string;
  book_id: string;
  store_id: string;
  url: string;
  sort_order: number;
};

export type Banner = {
  id: string;
  title_tr: string | null;
  title_en: string | null;
  subtitle_tr: string | null;
  subtitle_en: string | null;
  cta_tr: string | null;
  cta_en: string | null;
  link_url: string | null;
  book_id: string | null;
  image_desktop_url: string;
  image_mobile_url: string | null;
  text_theme: "light" | "dark";
  is_active: boolean;
  sort_order: number;
};

export type Page = {
  slug: string;
  title_tr: string;
  title_en: string;
  body_tr: string | null;
  body_en: string | null;
};

export type Settings = {
  id: 1;
  company_name: string;
  featured_book_id: string | null;
  featured_text_tr: string | null;
  featured_text_en: string | null;
  home_about_tr: string | null;
  home_about_en: string | null;
  submission_tr: string | null;
  submission_en: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  map_query: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: "genel" | "dosya" | "basin" | "satis";
  message: string;
  is_read: boolean;
  created_at: string;
};

/** Sitede kullanılan, ilişkileri çözülmüş kitap. */
export type BookView = Book & {
  authors: Author[];
  category: Category | null;
  series: Series | null;
  imprint: Imprint | null;
  links: (BookLink & { store: Store })[];
};
