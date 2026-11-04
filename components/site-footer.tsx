import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-night text-paper">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <Image
            src="/brand/muhtelif-logo-white.png"
            alt="Muhtelif Kitap"
            width={951}
            height={564}
            className="h-20 w-auto"
          />
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-paper/70">
            Roman, öykü, şiir ve spekülatif kurgu. Muhtelif okurlar için muhtelif kitaplar.
          </p>
        </div>

        <nav aria-label="Alt menü" className="md:col-span-3">
          <p className="label text-paper/50">Gezin</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-lg hover:underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="label text-paper/50">Kardeş yayınevi</p>
          <Link href="/hakkimizda#baska-kitap" className="mt-4 inline-flex items-center gap-4 group">
            <Image
              src="/brand/baska-kitap-white.png"
              alt="Başka Kitap"
              width={635}
              height={770}
              className="h-20 w-auto"
            />
            <span className="text-lg text-paper/70 group-hover:text-paper">
              Başka Kitap <span aria-hidden>→</span>
            </span>
          </Link>
          {(SITE.email || SITE.instagram) && (
            <ul className="mt-8 space-y-1 text-lg">
              {SITE.email && (
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:underline underline-offset-4">
                    {SITE.email}
                  </a>
                </li>
              )}
              {SITE.instagram && (
                <li>
                  <a href={SITE.instagram} className="hover:underline underline-offset-4">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="label mx-auto flex max-w-[1400px] flex-wrap justify-between gap-2 px-4 py-6 text-paper/40 sm:px-8">
          <span>© {SITE.name}</span>
          <span>m u h t e l i f &nbsp; k i t a p</span>
        </div>
      </div>
    </footer>
  );
}
