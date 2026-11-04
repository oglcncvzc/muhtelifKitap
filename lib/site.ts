/**
 * Site genel bilgileri. İletişim bilgileri kesinleşince buradan güncelleyin;
 * boş bırakılan alanlar sitede gösterilmez.
 */
export const SITE = {
  name: "Muhtelif Kitap",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Muhtelif Kitap; roman, öykü, şiir ve spekülatif kurgu yayımlayan bağımsız yayınevi.",
  email: "" as string,
  instagram: "" as string,
  address: "" as string,
};

export const NAV = [
  { href: "/kitaplar", label: "Kitaplar" },
  { href: "/kitaplar?dizi=spekulatif", label: "Spekülatif" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;
