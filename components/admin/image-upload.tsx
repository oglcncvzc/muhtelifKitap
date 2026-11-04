"use client";

import { useId, useRef, useState } from "react";
import { useFieldError, Spinner } from "@/components/admin/admin-form";
import { FieldShell } from "@/components/admin/fields";
import { buttonClass, cx, Thumb } from "@/components/admin/ui";
import { formatBytes, processImage, uniquePath, uploadToStorage, type Bucket } from "@/components/admin/upload-utils";

type Value = { url: string; width: number | null; height: number | null; color: string | null };

const MAX_INPUT = 30 * 1024 * 1024;

/**
 * Görsel yükleyici: tarayıcıda küçültür, WebP'ye çevirir, ölçü ve ortalama rengi hesaplar,
 * Supabase Storage'a yükler. Sonuçlar gizli alanlarla forma eklenir.
 */
export function ImageUpload({
  label,
  hint,
  bucket,
  folder,
  baseName,
  maxEdge,
  names,
  initial,
  required,
  aspect = "auto",
  onChange,
}: {
  label: string;
  hint?: string;
  bucket: Bucket;
  folder: string;
  /** Dosya adının kökü (genellikle slug). */
  baseName: string;
  maxEdge: number;
  names: { url: string; width?: string; height?: string; color?: string };
  initial?: { url?: string | null; width?: number | null; height?: number | null; color?: string | null };
  required?: boolean;
  aspect?: "auto" | "cover" | "wide" | "square" | "portrait";
  onChange?: (v: Value) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const serverError = useFieldError(names.url);
  const [value, setValue] = useState<Value>({
    url: initial?.url ?? "",
    width: initial?.width ?? null,
    height: initial?.height ?? null,
    color: initial?.color ?? null,
  });
  const [stage, setStage] = useState<"idle" | "processing" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const busy = stage !== "idle";

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setInfo(null);
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_INPUT) {
      setError(`Dosya çok büyük (${formatBytes(file.size)}). En fazla 30 MB.`);
      return;
    }
    try {
      setStage("processing");
      const img = await processImage(file, maxEdge);
      setStage("uploading");
      const url = await uploadToStorage(bucket, uniquePath(folder, baseName, img.ext), img.blob, img.contentType);
      const next = { url, width: img.width, height: img.height, color: img.color };
      setValue(next);
      onChange?.(next);
      setInfo(`${img.width}×${img.height} px · ${formatBytes(img.blob.size)} · ${img.ext.toUpperCase()} — kaydetmeyi unutmayın.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi.");
    } finally {
      setStage("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    const next = { url: "", width: null, height: null, color: null };
    setValue(next);
    onChange?.(next);
    setInfo("Görsel kaldırılacak — kaydetmeyi unutmayın.");
  }

  const shownError = error ?? serverError;
  const aspectClass =
    aspect === "cover" ? "aspect-[2/3] w-28" : aspect === "wide" ? "aspect-[3/1] w-full max-w-md" : aspect === "square" ? "aspect-square w-28" : aspect === "portrait" ? "aspect-[4/5] w-28" : "h-28 w-auto max-w-[14rem]";

  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={shownError ?? undefined}>
      <input type="hidden" name={names.url} value={value.url} />
      {names.width && <input type="hidden" name={names.width} value={value.width ?? ""} />}
      {names.height && <input type="hidden" name={names.height} value={value.height ?? ""} />}
      {names.color && <input type="hidden" name={names.color} value={value.color ?? ""} />}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy) void handle(e.dataTransfer.files[0]);
        }}
        className={cx(
          "flex flex-col gap-4 rounded-md border border-dashed p-3 sm:flex-row sm:items-center",
          dragOver ? "border-ink bg-paper-2/60" : "border-rule bg-paper/40",
          shownError && "border-red-400",
        )}
      >
        <div className={cx("relative shrink-0 overflow-hidden rounded border border-rule bg-white", aspectClass)}>
          {value.url ? (
            <Thumb src={value.url} alt={`${label} önizlemesi`} className={cx("size-full", aspect === "auto" && "object-contain")} />
          ) : (
            <div className="flex size-full min-w-24 items-center justify-center px-2 text-center text-[11px] text-muted">Görsel yok</div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75">
              <Spinner className="size-5 text-ink" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonClass("secondary", "sm")}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-describedby={`${id}-status`}
            >
              {value.url ? "Değiştir" : "Görsel seç"}
            </button>
            {value.url && (
              <button type="button" className={buttonClass("ghost", "sm")} onClick={clear} disabled={busy}>
                Kaldır
              </button>
            )}
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => void handle(e.target.files?.[0])}
            />
          </div>
          <p id={`${id}-status`} className="text-xs text-muted" aria-live="polite">
            {stage === "processing" && "Görsel hazırlanıyor (küçültme ve WebP dönüştürme)…"}
            {stage === "uploading" && "Yükleniyor…"}
            {stage === "idle" && (info ?? (value.url ? "Dosyayı buraya sürükleyerek de değiştirebilirsiniz." : "Dosyayı buraya sürükleyin ya da seçin."))}
          </p>
          {busy && (
            <div className="h-1 w-full overflow-hidden rounded bg-paper-2" aria-hidden>
              <div className={cx("h-full bg-ink transition-all duration-700", stage === "processing" ? "w-1/3" : "w-4/5 animate-pulse")} />
            </div>
          )}
          {value.url && value.color && (
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="inline-block size-3 rounded-sm border border-rule" style={{ background: value.color }} aria-hidden />
              Ortalama renk {value.color}
              {value.width && value.height ? ` · ${value.width}×${value.height}` : ""}
            </p>
          )}
        </div>
      </div>
    </FieldShell>
  );
}
