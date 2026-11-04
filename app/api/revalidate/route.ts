import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { CATALOG_TAG } from "@/lib/data";

/**
 * Supabase Database Webhook'u (books / authors tablolarında insert/update/delete)
 * bu adrese POST atar; katalog önbelleği yenilenir.
 * Header: x-revalidate-secret: <REVALIDATE_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  if (
    !secret ||
    given.length !== secret.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(secret))
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CATALOG_TAG, "max");
  return Response.json({ ok: true, revalidated: CATALOG_TAG });
}
