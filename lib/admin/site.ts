import { href, type RouteKey } from "@/lib/i18n";

/** Herkese açık sitenin adresi (yönetim alan adı ayrı olabileceği için mutlak). */
export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010").replace(/\/+$/, "");

/** Sitedeki TR sayfa bağlantısı (yeni sekmede açmak için). */
export function publicUrl(key?: RouteKey, slug?: string) {
  return `${PUBLIC_SITE_URL}${href("tr", key, slug)}`;
}
