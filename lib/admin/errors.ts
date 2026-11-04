import "server-only";

type DbError = { code?: string; message?: string; details?: string | null; hint?: string | null } | null | undefined;

/** Supabase/PostgREST/Storage/Auth hatalarını okunur Türkçe mesaja çevirir. */
export function dbErrorMessage(error: DbError, opts: { unique?: string } = {}): string {
  if (!error) return "Beklenmeyen bir hata oluştu.";
  const code = error.code ?? "";
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  console.error("[admin] Supabase hatası:", code, error.message, error.details ?? "");

  switch (code) {
    case "23505":
      if (opts.unique) return opts.unique;
      if (text.includes("slug")) return "Bu kısa ad (slug) başka bir kayıtta kullanılıyor. Lütfen farklı bir kısa ad girin.";
      return "Bu kayıt zaten mevcut (benzersiz olması gereken bir değer tekrar ediyor).";
    case "23503":
      return "Bu kayıt başka kayıtlarla ilişkili olduğu için işlem tamamlanamadı.";
    case "23502":
      return "Zorunlu bir alan boş bırakılmış.";
    case "23514":
      return "Girilen değerlerden biri geçerli değil (ör. sayfa sayısı 0'dan büyük olmalı).";
    case "22P02":
    case "22007":
    case "22008":
      return "Girilen değerlerden birinin biçimi geçersiz.";
    case "42501":
    case "PGRST301":
    case "PGRST302":
      return "Bu işlem için yetkiniz yok. Oturumunuz sona ermiş olabilir; çıkış yapıp tekrar giriş yapın.";
    case "PGRST116":
      return "Kayıt bulunamadı.";
  }
  if (text.includes("row-level security") || text.includes("permission denied")) {
    return "Bu işlem için yetkiniz yok. Oturumunuz sona ermiş olabilir; çıkış yapıp tekrar giriş yapın.";
  }
  if (text.includes("fetch failed") || text.includes("network")) {
    return "Veritabanına bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.";
  }
  return "Kayıt sırasında beklenmeyen bir veritabanı hatası oluştu. Lütfen tekrar deneyin.";
}

/** Supabase Auth hata mesajlarını Türkçeleştirir. */
export function authErrorMessage(error: { message?: string; code?: string; status?: number } | null | undefined): string {
  if (!error) return "Beklenmeyen bir hata oluştu.";
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  console.error("[admin] Auth hatası:", code, error.message);
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "E-posta adresi veya şifre hatalı.";
  if (code === "email_not_confirmed") return "E-posta adresi henüz doğrulanmamış.";
  if (code === "weak_password" || msg.includes("password should")) return "Şifre yeterince güçlü değil. En az 8 karakter kullanın.";
  if (code === "same_password") return "Yeni şifre eskisiyle aynı olamaz.";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || error.status === 429)
    return "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
  if (code === "email_exists" || code === "user_already_exists" || msg.includes("already been registered"))
    return "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.";
  if (code === "session_not_found" || code === "session_expired" || msg.includes("auth session missing"))
    return "Oturumunuz bulunamadı ya da süresi doldu. Lütfen tekrar giriş yapın.";
  if (code === "otp_expired" || msg.includes("expired")) return "Bağlantının süresi dolmuş. Lütfen yeni bir bağlantı isteyin.";
  return "Kimlik doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.";
}
