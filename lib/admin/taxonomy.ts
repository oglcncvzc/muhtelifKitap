/** Basit sözlük tabloları (tür, dizi, yayınevi, mağaza) için ortak yapılandırma. İstemci ve sunucuda kullanılır. */
export type TaxonomyKind = "categories" | "series" | "imprints" | "stores";

export type TaxField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "image";
  required?: boolean;
  tag?: "TR" | "EN";
  max?: number;
};

export type TaxonomyConfig = {
  singular: string;
  /** Slug'ın üretildiği ve listede gösterilen alan. */
  nameField: string;
  secondaryField?: string;
  fields: TaxField[];
  usage: { table: "books" | "book_links"; column: string };
  usageWarning: (n: number) => string;
  imageFolder?: string;
};

export const TAXONOMIES: Record<TaxonomyKind, TaxonomyConfig> = {
  categories: {
    singular: "tür",
    nameField: "name_tr",
    secondaryField: "name_en",
    fields: [
      { name: "name_tr", label: "Ad", tag: "TR", type: "text", required: true, max: 100 },
      { name: "name_en", label: "Ad", tag: "EN", type: "text", required: true, max: 100 },
    ],
    usage: { table: "books", column: "category_id" },
    usageWarning: (n) => `Bu tür ${n} kitapta kullanılıyor. Silinirse bu kitapların tür bilgisi boşalır.`,
  },
  series: {
    singular: "dizi",
    nameField: "name_tr",
    secondaryField: "name_en",
    fields: [
      { name: "name_tr", label: "Ad", tag: "TR", type: "text", required: true, max: 150 },
      { name: "name_en", label: "Ad", tag: "EN", type: "text", required: true, max: 150 },
      { name: "description_tr", label: "Açıklama", tag: "TR", type: "textarea", max: 5000 },
      { name: "description_en", label: "Açıklama", tag: "EN", type: "textarea", max: 5000 },
    ],
    usage: { table: "books", column: "series_id" },
    usageWarning: (n) => `Bu dizide ${n} kitap var. Silinirse bu kitapların dizi bilgisi boşalır.`,
  },
  imprints: {
    singular: "yayınevi",
    nameField: "name",
    secondaryField: "website",
    fields: [
      { name: "name", label: "Ad", type: "text", required: true, max: 150 },
      { name: "website", label: "İnternet sitesi", type: "url" },
      { name: "logo_url", label: "Logo", type: "image" },
    ],
    usage: { table: "books", column: "imprint_id" },
    usageWarning: (n) => `Bu yayınevine bağlı ${n} kitap var. Silinirse bu kitapların yayınevi bilgisi boşalır.`,
    imageFolder: "imprints",
  },
  stores: {
    singular: "mağaza",
    nameField: "name",
    fields: [{ name: "name", label: "Ad", type: "text", required: true, max: 100 }],
    usage: { table: "book_links", column: "store_id" },
    usageWarning: (n) => `Bu mağazaya ait ${n} satış bağlantısı var. Mağaza silinirse bu bağlantılar da kalıcı olarak silinir.`,
  },
};

export const isTaxonomyKind = (v: unknown): v is TaxonomyKind => typeof v === "string" && v in TAXONOMIES;

export type TaxonomyRow = { id: string; slug: string; sort_order: number } & Record<string, string | number | null>;
