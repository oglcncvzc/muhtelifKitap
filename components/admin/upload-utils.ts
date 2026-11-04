import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { slugify } from "@/lib/admin/slug";

export type ProcessedImage = {
  blob: Blob;
  ext: "webp" | "jpg";
  contentType: string;
  width: number;
  height: number;
  color: string;
};

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close(): void }> {
  if ("createImageBitmap" in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // Bazı biçimlerde (ör. SVG) <img> yoluna düş
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const width = img.naturalWidth || 1200;
    const height = img.naturalHeight || 1200;
    return { source: img, width, height, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("Görsel okunamadı. JPG, PNG veya WebP biçiminde bir dosya deneyin.");
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Ortalama renk (#rrggbb): görseli küçültüp piksellerin ortalaması alınır. */
function averageColor(source: CanvasImageSource, w: number, h: number): string {
  const size = 24;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = Math.max(1, Math.round((size * h) / w));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "#e7e5e0";
  ctx.drawImage(source, 0, 0, c.width, c.height);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let r = 0, g = 0, b = 0, a = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    r += data[i] * alpha;
    g += data[i + 1] * alpha;
    b += data[i + 2] * alpha;
    a += alpha;
  }
  if (a === 0) return "#e7e5e0";
  const hex = (v: number) => Math.round(v / a).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Görseli küçültür (uzun kenar ≤ maxEdge), WebP'ye çevirir; ölçü ve ortalama rengi hesaplar. */
export async function processImage(file: File, maxEdge: number, quality = 0.85): Promise<ProcessedImage> {
  const img = await decode(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tarayıcınız görsel işlemeyi desteklemiyor.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img.source, 0, 0, width, height);
    const color = averageColor(canvas, width, height);

    let blob = await toBlob(canvas, "image/webp", quality);
    let ext: ProcessedImage["ext"] = "webp";
    if (!blob || blob.type !== "image/webp") {
      // WebP kodlamayı desteklemeyen eski tarayıcılar
      blob = await toBlob(canvas, "image/jpeg", quality);
      ext = "jpg";
    }
    if (!blob) throw new Error("Görsel dönüştürülemedi.");
    return { blob, ext, contentType: blob.type, width, height, color };
  } finally {
    img.close();
  }
}

/** Benzersiz dosya yolu: klasör/kisa-ad-zamandamgasi.uzanti */
export function uniquePath(folder: string, baseName: string, ext: string) {
  const base = slugify(baseName).slice(0, 60) || "dosya";
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${folder ? `${folder.replace(/\/+$/, "")}/` : ""}${base}-${stamp}.${ext}`;
}

export type Bucket = "covers" | "media" | "files";

/** Supabase Storage'a yükler ve herkese açık adresi döndürür. */
export async function uploadToStorage(bucket: Bucket, path: string, body: Blob, contentType: string): Promise<string> {
  const sb = createSupabaseBrowserClient();
  const { error } = await sb.storage.from(bucket).upload(path, body, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("row-level security") || msg.includes("unauthorized") || msg.includes("jwt"))
      throw new Error("Yükleme yetkiniz yok. Oturumunuz sona ermiş olabilir; sayfayı yenileyip tekrar deneyin.");
    if (msg.includes("payload too large") || msg.includes("exceeded the maximum"))
      throw new Error("Dosya, depolama alanının izin verdiği boyutu aşıyor.");
    if (msg.includes("mime") || msg.includes("invalid"))
      throw new Error("Bu dosya türü yüklenemiyor.");
    throw new Error("Dosya yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.");
  }
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
