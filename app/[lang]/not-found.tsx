"use client";

import { usePathname } from "next/navigation";
import { ButtonLink, Container } from "@/components/site/ui";
import { getDict, href, parsePublicPath } from "@/lib/i18n";

export default function NotFound() {
  const pathname = usePathname();
  const { lang } = parsePublicPath(pathname ?? "/");
  const t = getDict(lang).notFound;
  return (
    <Container className="py-24 sm:py-32">
      <p className="label text-muted">404</p>
      <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)]">{t.title}</h1>
      <p className="mt-6 max-w-lg text-xl text-ink-2">{t.text}</p>
      <div className="mt-10">
        <ButtonLink href={href(lang, "books")}>
          {t.back} <span aria-hidden>→</span>
        </ButtonLink>
      </div>
    </Container>
  );
}
