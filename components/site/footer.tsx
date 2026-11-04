import Image from "next/image";
import Link from "next/link";
import { getDict, href } from "@/lib/i18n";
import type { Locale, Settings } from "@/lib/types";

export const SOCIALS = [
  ["instagram", "Instagram"],
  ["x", "X"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["linkedin", "LinkedIn"],
] as const;

export function Footer({ lang, settings, year }: { lang: Locale; settings: Settings | null; year: number }) {
  const t = getDict(lang);
  const socials = SOCIALS.filter(([k]) => settings?.[k]);

  return (
    <footer className="mt-28 border-t border-rule bg-paper-2">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href={href(lang)} aria-label="Muhtelif Kitap">
            <Image src="/brand/muhtelif-logo.png" alt="Muhtelif Kitap" width={951} height={564} className="h-14 w-auto" />
          </Link>
        </div>

        <div className="space-y-1 text-ink-2 md:col-span-4">
          {settings?.address && <p className="whitespace-pre-line">{settings.address}</p>}
          {settings?.phone && (
            <p>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                {settings.phone}
              </a>
            </p>
          )}
          {settings?.email && (
            <p>
              <a href={`mailto:${settings.email}`} className="hover:text-ink">
                {settings.email}
              </a>
            </p>
          )}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-3">
              {socials.map(([k, label]) => (
                <li key={k}>
                  <a href={settings![k]!} target="_blank" rel="noopener noreferrer" className="label hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {!settings?.address && !settings?.phone && !settings?.email && (
            <Link href={href(lang, "contact")} className="hover:text-ink">
              {t.nav.contact} →
            </Link>
          )}
        </div>

        <nav aria-label={t.footer.legal} className="md:col-span-4">
          <ul className="space-y-1 text-ink-2">
            <li><Link href={href(lang, "legal/kvkk")} className="hover:text-ink">{t.footer.kvkk}</Link></li>
            <li><Link href={href(lang, "legal/gizlilik")} className="hover:text-ink">{t.footer.privacy}</Link></li>
            <li><Link href={href(lang, "legal/cerez")} className="hover:text-ink">{t.footer.cookies}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-rule">
        <p className="label mx-auto max-w-[1320px] px-4 py-5 text-muted sm:px-8">
          © {year} {settings?.company_name ?? "Muhtelif Kitap"}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
