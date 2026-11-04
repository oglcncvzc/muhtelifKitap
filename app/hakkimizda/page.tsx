import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAuthors, getBooks } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Muhtelif Kitap ve kardeş yayınevi Başka Kitap hakkında.",
};

export default async function HakkimizdaPage() {
  const [books, authors] = await Promise.all([getBooks(), getAuthors()]);
  const stats = [
    { n: books.length, label: "Kitap" },
    { n: authors.length, label: "Yazar & şair" },
    { n: books.filter((b) => b.category === "siir").length, label: "Şiir kitabı" },
    { n: books.filter((b) => b.series === "Muhtelif Spekülatif").length, label: "Spekülatif roman" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <header className="grid gap-10 pt-14 pb-16 sm:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-muted">Hakkımızda</p>
          <h1 className="display mt-4 text-[clamp(4rem,11vw,10rem)]">
            Muhtelif
            <span className="block font-serif text-[0.42em] leading-tight font-light italic normal-case tracking-tight">
              (sıf.) çeşit çeşit, türlü türlü.
            </span>
          </h1>
        </div>
        <div className="self-end lg:col-span-5">
          <Image src="/brand/muhtelif-logo.png" alt="" width={951} height={564} className="w-full max-w-sm" />
        </div>
      </header>

      <section className="grid gap-12 border-t border-ink pt-12 lg:grid-cols-12">
        <div className="space-y-6 text-xl leading-relaxed text-ink-2 lg:col-span-7 lg:col-start-6">
          <p className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-8xl first-letter:leading-[0.8] first-letter:text-ink">
            Muhtelif Kitap; roman, öykü, şiir ve inceleme yayımlayan bağımsız bir yayınevi.
            Adımız kataloğumuzu anlatıyor: tek bir türe, tek bir sese bağlı kalmadan, okunmayı
            hak eden metinleri yan yana getiriyoruz.
          </p>
          <p>
            Şiir kitaplarımız aynı tasarım dilini paylaşan, renkleriyle rafta birbirini bulan bir
            seri olarak yayımlanıyor. <strong className="font-medium text-ink">Muhtelif Spekülatif</strong>{" "}
            dizisinde ise bilimkurgu, fantastik ve kıyamet sonrası anlatılara yer açıyoruz.
          </p>
        </div>
      </section>

      <section aria-label="Rakamlarla" className="mt-20 grid grid-cols-2 gap-px border-y border-ink bg-rule lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper px-4 py-8 sm:px-6">
            <p className="display text-8xl">{String(s.n).padStart(2, "0")}</p>
            <p className="label mt-2 text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <section id="baska-kitap" className="mt-24 scroll-mt-24 grid items-center gap-10 bg-night p-8 text-paper sm:p-14 md:grid-cols-[auto_1fr]">
        <Image src="/brand/baska-kitap-white.png" alt="Başka Kitap logosu" width={635} height={770} className="h-44 w-auto" />
        <div>
          <p className="label text-paper/55">Kardeş yayınevi</p>
          <h2 className="display mt-3 text-7xl">Başka Kitap</h2>
          <p className="mt-4 max-w-xl text-xl leading-relaxed text-paper/70">
            Muhtelif’in yanında, başka bir rafta. Başka Kitap yayınları da yakında bu sitede yer alacak.
          </p>
        </div>
      </section>

      <div className="mt-20 flex flex-wrap gap-3">
        <Link href="/kitaplar" className="label inline-flex h-12 items-center gap-3 bg-ink px-6 text-paper hover:bg-ink-2">
          Kataloğa göz at <span aria-hidden>→</span>
        </Link>
        <Link href="/iletisim" className="label inline-flex h-12 items-center border border-ink px-6 hover:bg-ink hover:text-paper">
          Bize yazın
        </Link>
      </div>
    </div>
  );
}
