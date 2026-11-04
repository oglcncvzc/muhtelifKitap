"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/components/admin/ui";

type Item = { href: string; label: string; badge?: number };

export const NAV: { title?: string; items: Item[] }[] = [
  { items: [{ href: "/admin", label: "Genel bakış" }] },
  {
    title: "Katalog",
    items: [
      { href: "/admin/kitaplar", label: "Kitaplar" },
      { href: "/admin/yazarlar", label: "Yazarlar" },
      { href: "/admin/bannerlar", label: "Bannerlar" },
    ],
  },
  {
    title: "Sınıflandırma",
    items: [
      { href: "/admin/turler", label: "Türler" },
      { href: "/admin/diziler", label: "Diziler" },
      { href: "/admin/yayinevleri", label: "Yayınevleri" },
      { href: "/admin/magazalar", label: "Mağazalar" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/sayfalar", label: "Sayfalar" },
      { href: "/admin/ayarlar", label: "Site ayarları" },
      { href: "/admin/mesajlar", label: "Mesajlar" },
    ],
  },
  {
    title: "Hesap",
    items: [
      { href: "/admin/yoneticiler", label: "Yöneticiler" },
      { href: "/admin/hesap", label: "Hesabım" },
    ],
  },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Kenar çubuğu görünümü (etkin bağlantı bilgisi olmadan da çizilebilir). */
export function NavShell({
  pathname,
  email,
  unread,
  siteUrl,
}: {
  pathname: string | null;
  email?: string;
  unread?: number;
  siteUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobil üst çubuk */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-rule bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="text-[15px] font-semibold tracking-tight">
          Muhtelif <span className="font-normal text-muted">· Yönetim</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-rule px-3 text-sm"
        >
          <span aria-hidden className="text-base leading-none">{open ? "×" : "≡"}</span>
          Menü
        </button>
      </div>

      {open && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        id="admin-sidebar"
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-rule bg-paper-2/95 backdrop-blur transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:max-w-none lg:translate-x-0 lg:bg-paper-2/60",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full",
        )}
        aria-label="Yönetim menüsü"
      >
        <div className="flex h-14 items-center border-b border-rule px-5 lg:h-16">
          <Link href="/admin" className="text-[15px] font-semibold tracking-tight">
            Muhtelif Kitap
            <span className="block text-xs font-normal text-muted">Yönetim paneli</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group, gi) => (
            <div key={gi} className={gi ? "mt-5" : undefined}>
              {group.title && (
                <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{group.title}</p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const badge = item.href === "/admin/mesajlar" ? unread : undefined;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
                          active ? "bg-white font-medium text-ink shadow-xs ring-1 ring-rule" : "text-ink-2 hover:bg-white/70 hover:text-ink",
                        )}
                      >
                        {item.label}
                        {badge ? (
                          <span className="rounded-full bg-ink px-1.5 text-[11px] leading-5 font-medium text-white tabular-nums">
                            {badge}
                            <span className="sr-only"> okunmamış</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-rule px-5 py-4 text-sm">
          <a href={siteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-ink-2 hover:text-ink">
            Siteyi görüntüle <span aria-hidden>↗</span>
          </a>
          {email && (
            <p className="truncate text-xs text-muted" title={email}>
              {email}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

/** Etkin sayfayı adresten okuyan kenar çubuğu (Suspense içinde kullanılmalı). */
export function AdminNav(props: { email?: string; unread?: number; siteUrl: string }) {
  const pathname = usePathname();
  return <NavShell pathname={pathname} {...props} />;
}
