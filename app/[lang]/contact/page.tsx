import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SOCIALS } from "@/components/site/footer";
import { Container, PageHeader } from "@/components/site/ui";
import { getCatalog } from "@/lib/data";
import { getDict, isLocale, pick } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { ContactForm } from "./contact-form";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return pageMeta({
    lang,
    key: "contact",
    title: getDict(lang).nav.contact,
    description:
      lang === "tr"
        ? "Muhtelif Kitap ile iletişime geçin: adres, telefon, e-posta ve dosya gönderimi."
        : "Get in touch with Muhtelif Kitap: address, phone, email and manuscript submissions.",
  });
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const { settings: s } = await getCatalog();
  const socials = SOCIALS.filter(([k]) => s?.[k]);
  const submission = pick(lang, s?.submission_tr, s?.submission_en);
  const mapQuery = s?.map_query || s?.address;

  return (
    <Container>
      <PageHeader title={t.nav.contact} />
      <div className="grid gap-14 border-t border-rule pt-12 lg:grid-cols-12">
        <aside className="space-y-8 lg:col-span-4">
          {s?.address && (
            <div>
              <p className="label text-muted">{t.contactInfo.address}</p>
              <p className="mt-2 text-lg whitespace-pre-line">{s.address}</p>
            </div>
          )}
          {s?.phone && (
            <div>
              <p className="label text-muted">{t.contactInfo.phone}</p>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-2 block text-lg hover:underline underline-offset-4">{s.phone}</a>
            </div>
          )}
          {s?.email && (
            <div>
              <p className="label text-muted">{t.contactInfo.email}</p>
              <a href={`mailto:${s.email}`} className="mt-2 block text-lg hover:underline underline-offset-4">{s.email}</a>
            </div>
          )}
          {socials.length > 0 && (
            <div>
              <p className="label text-muted">{t.contactInfo.social}</p>
              <ul className="mt-2 space-y-1 text-lg">
                {socials.map(([k, label]) => (
                  <li key={k}>
                    <a href={s![k]!} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                      {label} <span aria-hidden className="text-muted">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {submission && (
            <div className="border-t border-rule pt-8">
              <p className="label text-muted">{t.contactInfo.submission}</p>
              <p className="mt-2 text-lg leading-relaxed text-ink-2">{submission}</p>
            </div>
          )}
        </aside>

        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm lang={lang} />
        </div>
      </div>

      {mapQuery && (
        <section aria-label={t.contactInfo.map} className="mt-20">
          <iframe
            title={t.contactInfo.map}
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&hl=${lang}`}
            className="h-[360px] w-full border-0 grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </Container>
  );
}
