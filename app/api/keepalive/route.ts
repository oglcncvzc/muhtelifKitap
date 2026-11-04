import { timingSafeEqual } from "node:crypto";
import { getSupabase } from "@/lib/supabase";

/**
 * Supabase ücretsiz planı 7 gün etkinlik olmayan projeleri duraklatır.
 * Vercel Cron (vercel.json) bu adresi her gün çağırır ve veritabanına gerçek
 * bir sorgu atar. Vercel, CRON_SECRET tanımlıysa isteğe
 * "Authorization: Bearer <CRON_SECRET>" başlığını kendisi ekler.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const expected = `Bearer ${secret}`;
  const given = request.headers.get("authorization") ?? "";
  if (
    !secret ||
    given.length !== expected.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ ok: false, error: "Supabase yapılandırılmamış" }, { status: 500 });
  }

  const { count, error } = await supabase
    .from("books")
    .select("slug", { count: "exact", head: true });

  if (error) {
    console.error("[keepalive]", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }

  return Response.json(
    { ok: true, books: count, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
