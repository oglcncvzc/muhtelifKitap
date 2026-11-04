import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Muhtelif Kitap ile iletişime geçin: dosya gönderimi, basın ve satış.",
};

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <header className="pt-14 pb-12 sm:pt-20">
        <p className="label text-muted">Bize yazın</p>
        <h1 className="display mt-4 text-[clamp(4rem,12vw,11rem)]">İletişim</h1>
      </header>
      <div className="grid gap-16 border-t border-ink pt-12 lg:grid-cols-12">
        <aside className="space-y-10 lg:col-span-4">
          <div>
            <p className="label text-muted">Dosya gönderimi</p>
            <p className="mt-3 text-xl leading-relaxed text-ink-2">
              Roman, öykü, şiir ya da spekülatif kurgu dosyanız mı var? Formda “Dosya gönderimi”
              konusunu seçip kısaca kendinizden ve metninizden bahsedin.
            </p>
          </div>
          {SITE.email && (
            <div>
              <p className="label text-muted">E-posta</p>
              <a href={`mailto:${SITE.email}`} className="mt-3 block font-serif text-2xl underline underline-offset-4">
                {SITE.email}
              </a>
            </div>
          )}
          {SITE.address && (
            <div>
              <p className="label text-muted">Adres</p>
              <p className="mt-3 text-xl whitespace-pre-line">{SITE.address}</p>
            </div>
          )}
        </aside>
        <div className="relative lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
