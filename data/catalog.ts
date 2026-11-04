/**
 * İlk kurulum verisi (yalnızca `npm run seed:sql` kullanır).
 * Site içeriği Supabase'den okunur ve yönetim panelinden düzenlenir.
 * Bilgiler kapaklardan alınmıştır.
 */

export const categories = [
  { slug: "roman", tr: "Roman", en: "Novel" },
  { slug: "oyku", tr: "Öykü", en: "Short Stories" },
  { slug: "siir", tr: "Şiir", en: "Poetry" },
  { slug: "inceleme", tr: "İnceleme", en: "Non-fiction" },
];

export const series = [
  {
    slug: "muhtelif-spekulatif",
    tr: "Muhtelif Spekülatif",
    en: "Muhtelif Speculative",
    descTr: "Bilimkurgu, fantastik ve kıyamet sonrası anlatılar.",
    descEn: "Science fiction, fantasy and post-apocalyptic narratives.",
  },
  {
    slug: "muhtelif-siir",
    tr: "Muhtelif Şiir",
    en: "Muhtelif Poetry",
    descTr: "Ortak bir tasarım diliyle yayımlanan şiir dizimiz.",
    descEn: "Our poetry series, published with a shared design language.",
  },
];

export const imprints = [
  { slug: "muhtelif-kitap", name: "Muhtelif Kitap", logo: "/brand/muhtelif-logo.png" },
  { slug: "bandini-kitap", name: "Bandini Kitap", logo: null },
  { slug: "baska-kitap", name: "Başka Kitap", logo: "/brand/baska-kitap.png" },
];

export const stores = [
  { slug: "amazon-tr", name: "Amazon Türkiye" },
  { slug: "kitapyurdu", name: "Kitapyurdu" },
];

type SeedBook = {
  slug: string;
  title: string;
  subtitle?: string;
  author: { slug: string; name: string };
  category: string;
  series?: string;
  imprint: string;
  translator?: string;
  editor?: string;
  coverDesigner?: string;
  edition?: string;
  language: string;
  isNew?: boolean;
  cover: { width: number; height: number; color: string };
  sortOrder: number;
};

const SPEK = "muhtelif-spekulatif";
const SIIR = "muhtelif-siir";
const MK = "muhtelif-kitap";

export const books: SeedBook[] = [
  { slug: "ottopunk-1-fasil", title: "Ottopunk", subtitle: "1. Fasıl", author: { slug: "erim-sisman", name: "Erim Şişman" }, category: "roman", series: SPEK, imprint: MK, language: "Türkçe", isNew: true, cover: { width: 1000, height: 1566, color: "#223629" }, sortOrder: 10 },
  { slug: "isiktan-sonra-kiyamet-kayitlari", title: "Işıktan Sonra", subtitle: "Kıyamet Kayıtları", author: { slug: "mahmut-yigit-cakin", name: "Mahmut Yiğit Çakın" }, category: "roman", series: SPEK, imprint: MK, language: "Türkçe", isNew: true, cover: { width: 1000, height: 1555, color: "#2a1b29" }, sortOrder: 20 },
  { slug: "tarihin-molozlari-ustunde", title: "Tarihin Molozları Üstünde", author: { slug: "ayhan-koc", name: "Ayhan Koç" }, category: "roman", series: SPEK, imprint: MK, language: "Türkçe", isNew: true, cover: { width: 1000, height: 1516, color: "#2b4210" }, sortOrder: 30 },
  { slug: "kopuk-beyazi", title: "Köpük Beyazı", author: { slug: "ahmet-rifat-ilhan", name: "Ahmet Rıfat İlhan" }, category: "oyku", imprint: MK, language: "Türkçe", isNew: true, cover: { width: 1000, height: 1555, color: "#fed351" }, sortOrder: 40 },
  { slug: "boslugun-icinden", title: "Boşluğun İçinden", author: { slug: "kader-mentes-bolat", name: "Kader Menteş Bolat" }, category: "oyku", imprint: MK, edition: "2. Baskı", language: "Türkçe", cover: { width: 1000, height: 1521, color: "#d8c856" }, sortOrder: 50 },
  { slug: "eve-ne-zaman-donecegiz", title: "Eve Ne Zaman Döneceğiz?", author: { slug: "serhat-koroglu", name: "Serhat Köroğlu" }, category: "oyku", imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1559, color: "#9c7e4d" }, sortOrder: 60 },
  { slug: "dunya-bizi-unutacak", title: "Dünya Bizi Unutacak", author: { slug: "idris-ozyol", name: "İdris Özyol" }, category: "siir", series: SIIR, imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1562, color: "#397a9d" }, sortOrder: 70 },
  { slug: "golgeler-cururken", title: "Gölgeler Çürürken", author: { slug: "devrim-horlu", name: "Devrim Horlu" }, category: "siir", series: SIIR, imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1500, color: "#4bf46b" }, sortOrder: 80 },
  { slug: "nis", title: "Niş", author: { slug: "ceren-biber", name: "Ceren Biber" }, category: "siir", series: SIIR, imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1501, color: "#f26029" }, sortOrder: 90 },
  { slug: "orumcek-supurgesi", title: "Örümcek Süpürgesi", author: { slug: "bengu-ozsoy", name: "Bengü Özsoy" }, category: "siir", series: SIIR, imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1501, color: "#3539f6" }, sortOrder: 100 },
  { slug: "sarkilar-ve-ruyalar", title: "Şarkılar ve Rüyalar", author: { slug: "gokhan-arslan", name: "Gökhan Arslan" }, category: "siir", series: SIIR, imprint: MK, editor: "Emel Mutlu", language: "Türkçe", cover: { width: 1000, height: 1518, color: "#6361dc" }, sortOrder: 110 },
  { slug: "dut-sesinden-atmaca", title: "Dut Sesinden Atmaca", author: { slug: "gokhan-arslan", name: "Gökhan Arslan" }, category: "siir", series: SIIR, imprint: MK, language: "Türkçe", cover: { width: 1000, height: 1629, color: "#e5e5e3" }, sortOrder: 120 },
  { slug: "kamburumun-insani", title: "Kamburumun İnsanı", author: { slug: "devrim-horlu", name: "Devrim Horlu" }, category: "siir", series: SIIR, imprint: MK, edition: "2. Baskı", language: "Türkçe", cover: { width: 1000, height: 1519, color: "#b1a05b" }, sortOrder: 130 },
  { slug: "kralcik", title: "Kralcık", author: { slug: "jean-francois-beauchemin", name: "Jean-François Beauchemin" }, category: "roman", imprint: "bandini-kitap", translator: "Ece Peker", language: "Türkçe", cover: { width: 1000, height: 1494, color: "#e5e1ce" }, sortOrder: 140 },
  { slug: "in-communication-we-trust", title: "In Communication We Trust", subtitle: "New Diplomacy Language for Sustainable Ecosystem and Prosperous Society", author: { slug: "ipek-tekdemir", name: "İpek Tekdemir" }, category: "inceleme", imprint: MK, coverDesigner: "İsmail Acar", language: "İngilizce", cover: { width: 1000, height: 1478, color: "#999a94" }, sortOrder: 150 },
];
