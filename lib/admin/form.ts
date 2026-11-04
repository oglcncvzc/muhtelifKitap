import "server-only";
import type { FieldErrors } from "@/lib/admin/action-state";
import { SLUG_RE, slugify } from "@/lib/admin/slug";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

type TextOpts = { required?: boolean; max?: number; label?: string };

/**
 * FormData okuyucu: her alanı tipine göre doğrular, hataları alan adına göre toplar.
 * İstemciden gelen hiçbir değere güvenilmez; yalnızca açıkça okunan alanlar kayda girer.
 */
export function formReader(fd: FormData) {
  const errors: FieldErrors = {};
  const raw = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const need = (k: string, opts: TextOpts) => {
    errors[k] = opts.label ? `${opts.label} zorunludur.` : "Bu alan zorunludur.";
    return null;
  };

  const r = {
    errors,
    ok: () => Object.keys(errors).length === 0,
    fail: (k: string, msg: string) => {
      errors[k] = msg;
    },

    text(k: string, opts: TextOpts = {}): string | null {
      const v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      const max = opts.max ?? 20000;
      if (v.length > max) {
        errors[k] = `En fazla ${max} karakter girilebilir.`;
        return null;
      }
      return v;
    },

    /** http(s) adresi. "www.ornek.com" gibi girişlere https:// eklenir. */
    url(k: string, opts: TextOpts = {}): string | null {
      let v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = `https://${v}`;
      try {
        const u = new URL(v);
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
        if (!u.hostname.includes(".")) throw new Error();
        return u.toString();
      } catch {
        errors[k] = "Geçerli bir web adresi girin (ör. https://ornek.com).";
        return null;
      }
    },

    /** Tam adres ya da site içi yol (/kitaplar/...). */
    link(k: string, opts: TextOpts = {}): string | null {
      const v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      if (v.startsWith("/") && !v.startsWith("//")) return v;
      return r.url(k, opts);
    },

    email(k: string, opts: TextOpts = {}): string | null {
      const v = raw(k).toLowerCase();
      if (!v) return opts.required ? need(k, opts) : null;
      if (!EMAIL_RE.test(v) || v.length > 200) {
        errors[k] = "Geçerli bir e-posta adresi girin.";
        return null;
      }
      return v;
    },

    int(k: string, opts: TextOpts & { min?: number; max?: number } = {}): number | null {
      const v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      const n = Number(v);
      if (!Number.isInteger(n) || (opts.min !== undefined && n < opts.min) || (opts.max !== undefined && n > opts.max)) {
        errors[k] = opts.min !== undefined ? `${opts.min} veya daha büyük bir tam sayı girin.` : "Geçerli bir tam sayı girin.";
        return null;
      }
      return n;
    },

    date(k: string, opts: TextOpts = {}): string | null {
      const v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      if (!DATE_RE.test(v) || Number.isNaN(Date.parse(v))) {
        errors[k] = "Geçerli bir tarih girin.";
        return null;
      }
      return v;
    },

    bool: (k: string) => ["on", "true", "1"].includes(raw(k)),

    uuid(k: string, opts: TextOpts = {}): string | null {
      const v = raw(k);
      if (!v) return opts.required ? need(k, opts) : null;
      if (!UUID_RE.test(v)) {
        errors[k] = "Geçersiz seçim.";
        return null;
      }
      return v;
    },

    hex(k: string, fallback: string): string {
      const v = raw(k);
      return HEX_RE.test(v) ? v.toLowerCase() : fallback;
    },

    oneOf<T extends string>(k: string, values: readonly T[], fallback: T): T {
      const v = raw(k);
      return (values as readonly string[]).includes(v) ? (v as T) : fallback;
    },

    /** Slug: boşsa `from` değerinden üretilir; biçim doğrulanır. */
    slug(k: string, from: string | null): string | null {
      const v = raw(k) || (from ? slugify(from) : "");
      if (!v) {
        errors[k] = "Kısa ad (slug) zorunludur.";
        return null;
      }
      if (!SLUG_RE.test(v) || v.length > 80) {
        errors[k] = "Yalnızca küçük harf, rakam ve tire kullanın (ör. kirmizi-pazartesi).";
        return null;
      }
      return v;
    },

    all: (k: string) => fd.getAll(k).map((v) => (typeof v === "string" ? v.trim() : "")),
  };
  return r;
}
