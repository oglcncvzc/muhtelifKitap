import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "404 · Muhtelif Kitap",
  robots: { index: false },
};

/** Hiçbir rotaya uymayan adresler (dil katmanı dışı) için. */
export default function GlobalNotFound() {
  return (
    <html lang="tr">
      <body className="flex min-h-dvh items-center justify-center bg-paper p-8 text-ink">
        <main className="max-w-md text-center">
          <p className="label text-muted">404</p>
          <h1 className="mt-4 font-serif text-4xl">Sayfa bulunamadı · Page not found</h1>
          <p className="mt-8 flex justify-center gap-6">
            <Link href="/" className="underline underline-offset-4">Ana sayfa</Link>
            <Link href="/en" className="underline underline-offset-4">Home</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
