import type { Metadata, Viewport } from "next";
import { PUBLIC_SITE_URL } from "@/lib/admin/site";
import "../globals.css";
import "./admin.css";

/** Yönetim paneli kök düzeni (herkese açık sitenin düzeninden bağımsız). */
export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE_URL),
  title: { default: "Yönetim · Muhtelif Kitap", template: "%s · Yönetim · Muhtelif Kitap" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  themeColor: "#f2efe7",
};

// Panel sayfaları oturuma bağlıdır; her gezinme sunucuda beklenebilir.
export const instant = false;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="admin-root min-h-dvh antialiased">{children}</body>
    </html>
  );
}
