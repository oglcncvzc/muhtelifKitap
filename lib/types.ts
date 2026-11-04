export type Category = "roman" | "oyku" | "siir" | "inceleme";

export const CATEGORY_LABELS: Record<Category, string> = {
  roman: "Roman",
  oyku: "Öykü",
  siir: "Şiir",
  inceleme: "İnceleme",
};

export const CATEGORY_ORDER: Category[] = ["roman", "oyku", "siir", "inceleme"];

export type Author = {
  slug: string;
  name: string;
  bio?: string | null;
};

export type Cover = {
  src: string;
  width: number;
  height: number;
  /** Kapaktaki baskın renk, arka plan tonlaması için */
  color: string;
};

export type Book = {
  slug: string;
  title: string;
  subtitle?: string | null;
  author: Author;
  category: Category;
  /** Dizi adı, örn. "Muhtelif Spekülatif" */
  series?: string | null;
  /** Kapakta yer alan marka; varsayılan "Muhtelif Kitap" */
  imprint: string;
  translator?: string | null;
  editor?: string | null;
  coverArtist?: string | null;
  edition?: string | null;
  language: string;
  description?: string | null;
  isbn?: string | null;
  pages?: number | null;
  publishedYear?: number | null;
  price?: number | null;
  buyUrl?: string | null;
  cover: Cover;
  featured: boolean;
  sortOrder: number;
};
