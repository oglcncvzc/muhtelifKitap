"use client";

import { useId, useRef, useState } from "react";
import { useFieldError, Spinner } from "@/components/admin/admin-form";
import { FieldShell } from "@/components/admin/fields";
import { buttonClass, cx } from "@/components/admin/ui";
import { formatBytes, uniquePath, uploadToStorage } from "@/components/admin/upload-utils";

const MAX_PDF = 15 * 1024 * 1024;

/** PDF yükleyici (tadımlık okuma dosyası): files/samples/ altına olduğu gibi yükler. */
export function PdfUpload({
  label,
  hint,
  name,
  baseName,
  initialUrl,
}: {
  label: string;
  hint?: string;
  name: string;
  baseName: string;
  initialUrl?: string | null;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const serverError = useFieldError(name);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setInfo(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Yalnızca PDF dosyası yüklenebilir.");
      return;
    }
    if (file.size > MAX_PDF) {
      setError(`Dosya çok büyük (${formatBytes(file.size)}). En fazla 15 MB.`);
      return;
    }
    setBusy(true);
    try {
      const publicUrl = await uploadToStorage("files", uniquePath("samples", baseName, "pdf"), file, "application/pdf");
      setUrl(publicUrl);
      setInfo(`${file.name} (${formatBytes(file.size)}) yüklendi — kaydetmeyi unutmayın.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dosya yüklenemedi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shownError = error ?? serverError;
  return (
    <FieldShell id={id} label={label} hint={hint} error={shownError ?? undefined}>
      <input type="hidden" name={name} value={url} />
      <div className={cx("flex flex-wrap items-center gap-3 rounded-md border border-dashed bg-paper/40 p-3", shownError ? "border-red-400" : "border-rule")}>
        <span aria-hidden className="flex h-10 w-8 items-center justify-center rounded-sm border border-rule bg-white text-[9px] font-semibold text-red-700">
          PDF
        </span>
        <div className="min-w-0 flex-1 text-sm">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="block truncate text-ink underline underline-offset-2">
              {decodeURIComponent(url.split("/").pop() ?? "dosya.pdf")}
            </a>
          ) : (
            <span className="text-muted">Dosya yüklenmedi.</span>
          )}
          <p className="text-xs text-muted" aria-live="polite">
            {busy ? "Yükleniyor…" : info ?? "En fazla 15 MB."}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={buttonClass("secondary", "sm")} onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy && <Spinner />}
            {url ? "Değiştir" : "PDF seç"}
          </button>
          {url && (
            <button
              type="button"
              className={buttonClass("ghost", "sm")}
              onClick={() => {
                setUrl("");
                setInfo("Dosya kaldırılacak — kaydetmeyi unutmayın.");
              }}
              disabled={busy}
            >
              Kaldır
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void handle(e.target.files?.[0])}
        />
      </div>
    </FieldShell>
  );
}
