"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClass } from "@/components/admin/ui";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-white p-6">
      <h1 className="text-lg font-semibold text-ink">Bir şeyler ters gitti</h1>
      <p className="mt-1 text-sm text-muted">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Bağlantınızı kontrol edip tekrar deneyin; sorun sürerse
        çıkış yapıp yeniden giriş yapın.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted">Hata kodu: {error.digest}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={reset} className={buttonClass("primary")}>
          Tekrar dene
        </button>
        <Link href="/admin" className={buttonClass("secondary")}>
          Panele dön
        </Link>
      </div>
    </div>
  );
}
