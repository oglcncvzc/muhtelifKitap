"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/admin/ui";

type Toast = { id: number; tone: "success" | "error" | "info"; text: string };
type Push = (tone: Toast["tone"], text: string) => void;

const ToastContext = createContext<Push | null>(null);

/** Sağ altta kısa bilgilendirme mesajları. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback<Push>(
    (tone, text) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, text }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 8000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cx(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md px-4 py-3 text-sm shadow-lg ring-1",
              t.tone === "success" && "bg-ink text-white ring-black/10",
              t.tone === "info" && "bg-white text-ink ring-rule",
              t.tone === "error" && "bg-red-700 text-white ring-red-800",
            )}
          >
            <span aria-hidden className="mt-px">
              {t.tone === "success" ? "✓" : t.tone === "error" ? "!" : "i"}
            </span>
            <p className="flex-1">{t.text}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): Push {
  const push = use(ToastContext);
  return push ?? (() => {});
}

const FLASH: Record<string, [Toast["tone"], string]> = {
  olusturuldu: ["success", "Kayıt oluşturuldu."],
  silindi: ["success", "Kayıt silindi."],
  kaydedildi: ["success", "Değişiklikler kaydedildi."],
  sifre: ["success", "Şifreniz güncellendi."],
  "iliski-hatasi": ["error", "Kitap oluşturuldu ancak yazarlar/satış bağlantıları kaydedilemedi. Lütfen kontrol edip tekrar kaydedin."],
};

/** Yönlendirme sonrası (?durum=…) bir kez bildirim gösterir ve adresi temizler. */
export function Flash({ code }: { code?: string | null }) {
  const push = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);
  useEffect(() => {
    if (!code || shown.current) return;
    shown.current = true;
    const flash = FLASH[code];
    if (flash) push(flash[0], flash[1]);
    router.replace(pathname, { scroll: false });
  }, [code, push, router, pathname]);
  return null;
}
