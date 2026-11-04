"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  // Menü, açıldığı sayfaya bağlı; sayfa değişince kendiliğinden kapanır.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (href.includes("?")) return false;
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" aria-label="Muhtelif Kitap — ana sayfa" className="shrink-0">
          <Image
            src="/brand/muhtelif-logo.png"
            alt="Muhtelif Kitap"
            width={951}
            height={564}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Ana menü" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="label relative py-2 text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="label -mr-2 flex h-11 items-center gap-2 px-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobil-menu"
          onClick={() => setOpenedAt(open ? null : pathname)}
        >
          {open ? "Kapat" : "Menü"}
          <span aria-hidden className="relative block h-3 w-5">
            <span
              className={`absolute left-0 h-px w-5 bg-ink transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 h-px w-5 bg-ink transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobil-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 bg-paper md:hidden"
      >
        <nav aria-label="Mobil menü" className="px-4 pt-6">
          <ul className="divide-y divide-rule border-y border-rule">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="display flex items-center justify-between py-5 text-5xl"
                >
                  {item.label}
                  <span aria-hidden className="font-serif text-2xl normal-case">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
