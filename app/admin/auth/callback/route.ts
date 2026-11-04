import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/** Yalnızca panel içindeki göreli yollara yönlendir (açık yönlendirme engeli). */
function safeNext(next: string | null) {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || next.includes("://")) return "/admin";
  return next;
}

/** E-posta bağlantılarından (şifre sıfırlama, davet) dönüş: kodu oturuma çevirir. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error("[admin] Kod oturuma çevrilemedi:", error.code, error.message);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error("[admin] Doğrulama başarısız:", error.code, error.message);
  }
  return NextResponse.redirect(new URL("/admin/giris?hata=baglanti", origin));
}
