import Image from "next/image";
import Link from "next/link";
import { getBooks } from "@/lib/catalog";
import { BookCard, BookCover } from "@/components/book-card";
import { SectionHeading, Shelf } from "@/components/shelf";

export default async function Home() {
  const books = await getBooks();
  const spekulatif = books.filter((b) => b.series === "Muhtelif Spekülatif");
  const siir = books.filter((b) => b.category === "siir");
  const oyku = books.filter((b) => b.category === "oyku");
  const diger = books.filter(
    (b) => !b.series && (b.category === "roman" || b.category === "inceleme"),
  );

  const heroStack = ["nis", "ottopunk-1-fasil", "kopuk-beyazi", "orumcek-supurgesi", "golgeler-cururken"]
    .map((s) => books.find((b) => b.slug === s))
    .filter((b) => b !== undefined);

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden border-b border-rule">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 pt-12 pb-16 sm:px-8 lg:grid-cols-12 lg:pt-20 lg:pb-24">
          <div className="rise lg:col-span-6">
            <p className="label text-muted">Roman · Öykü · Şiir · Spekülatif</p>
            <h1 className="display mt-6 text-[clamp(4rem,10vw,9.5rem)]">
              Muhtelif
              <br />
              okurlara
              <br />
              <span className="block pt-3 font-serif text-[0.46em] font-light italic normal-case tracking-tight">
                muhtelif kitaplar.
              </span>
            </h1>
            <p className="mt-8 max-w-md text-xl leading-relaxed text-ink-2">
              Genç şairlerden spekülatif romanlara, öyküden çeviriye: kataloğumuzdaki{" "}
              {books.length} kitabın her biri kendi rafını hak ediyor.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/kitaplar"
                className="label inline-flex h-12 items-center gap-3 bg-ink px-6 text-paper transition-colors hover:bg-ink-2"
              >
                Kataloğa göz at <span aria-hidden>→</span>
              </Link>
              <Link
                href="/yazarlar"
                className="label inline-flex h-12 items-center border border-ink px-6 transition-colors hover:bg-ink hover:text-paper"
              >
                Yazarlar
              </Link>
            </div>
          </div>

          {/* Yelpaze kapaklar */}
          <div className="relative -mt-6 h-[340px] sm:mt-0 sm:h-[520px] lg:col-span-6 lg:h-[600px]" aria-hidden>
            {heroStack.map((b, i) => {
              const n = heroStack.length;
              const offset = i - (n - 1) / 2;
              return (
                <Link
                  key={b.slug}
                  href={`/kitaplar/${b.slug}`}
                  tabIndex={-1}
                  className="group absolute top-1/2 left-1/2 w-[40%] max-w-[270px] transition-transform duration-700 hover:z-20"
                  style={{
                    transform: `translate(calc(-50% + ${offset * 40}%), calc(-50% + ${Math.abs(offset) * 5}%)) rotate(${offset * 5}deg)`,
                    zIndex: 10 - Math.abs(Math.round(offset)),
                    animation: `rise 1s ${0.1 + i * 0.08}s cubic-bezier(.2,.7,.2,1) both`,
                  }}
                >
                  <BookCover
                    book={b}
                    priority
                    sizes="(min-width: 1024px) 300px, 44vw"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— Kayan başlıklar ——— */}
      <div className="overflow-hidden border-b border-rule bg-ink py-4 text-paper" aria-hidden>
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...books, ...books].map((b, i) => (
            <span key={i} className="display flex items-center gap-10 text-3xl">
              {b.title}
              <span className="text-signal">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ——— Muhtelif Spekülatif ——— */}
      <section className="relative overflow-hidden bg-night text-paper">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 10%, rgb(52 120 70 / .35), transparent 70%), radial-gradient(50% 50% at 85% 30%, rgb(170 20 60 / .28), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-4 py-24 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="label text-paper/55">Dizi · 01</p>
              <h2 className="display mt-4 text-7xl sm:text-8xl">
                Muhtelif
                <br />
                <span className="text-signal">Spekülatif</span>
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-paper/70">
                Bilimkurgu, fantastik ve kıyamet sonrası anlatılar. Alternatif tarihlerin,
                ışıksız dünyaların ve moloz yığınlarının arasından yazılmış romanlar.
              </p>
              <Link
                href="/kitaplar?dizi=spekulatif"
                className="label mt-8 inline-flex h-12 items-center gap-3 border border-paper/40 px-6 transition-colors hover:border-signal hover:text-signal"
              >
                Diziyi incele <span aria-hidden>→</span>
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:col-span-8">
              {spekulatif.map((b) => (
                <li key={b.slug}>
                  <BookCard book={b} tone="dark" sizes="(min-width: 1024px) 20vw, 45vw" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ——— Şiir ——— */}
      <section className="mx-auto max-w-[1400px] px-4 pt-28 sm:px-8">
        <SectionHeading index="02" title="Şiir" count={siir.length} href="/kitaplar?tur=siir" />
        <ul className="mt-10 -mx-4 flex snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-8 gap-5 overflow-x-auto px-4 pb-6 sm:-mx-8 sm:gap-8 sm:px-8 [scrollbar-width:thin]">
          {siir.map((b) => (
            <li key={b.slug} className="w-[62%] shrink-0 snap-start sm:w-[34%] lg:w-[16.5%]">
              <BookCard book={b} showCategory={false} sizes="(min-width: 1024px) 18vw, 60vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* ——— Öykü ——— */}
      <section className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-8">
        <SectionHeading index="03" title="Öykü" count={oyku.length} href="/kitaplar?tur=oyku" />
        <Shelf books={oyku} cols={4} />
      </section>

      {/* ——— Çeviri & İnceleme ——— */}
      {diger.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-8">
          <SectionHeading index="04" title="Çeviri & İnceleme" count={diger.length} href="/kitaplar" />
          <Shelf books={diger} cols={4} />
        </section>
      )}

      {/* ——— Başka Kitap ——— */}
      <section id="baska" className="mx-auto max-w-[1400px] px-4 pt-28 sm:px-8">
        <div className="grid items-center gap-10 border border-ink p-8 sm:p-12 md:grid-cols-[auto_1fr]">
          <Image
            src="/brand/baska-kitap.png"
            alt="Başka Kitap logosu"
            width={635}
            height={770}
            className="h-36 w-auto sm:h-44"
          />
          <div>
            <p className="label text-muted">Kardeş yayınevi</p>
            <h2 className="display mt-3 text-6xl sm:text-7xl">Başka Kitap</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-2">
              Muhtelif’in yanında, başka bir rafta: Başka Kitap yayınları da yakında bu sitede.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
