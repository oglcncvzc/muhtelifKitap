import type { Metadata } from "next";
import Link from "next/link";
import { ResetRequestForm } from "../forms";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-lg font-semibold">Şifremi unuttum</h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        E-posta adresinizi girin; şifrenizi yenilemeniz için bir bağlantı gönderelim. Bağlantıyı bu tarayıcıda açın.
      </p>
      <ResetRequestForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/admin/giris" className="text-muted hover:text-ink">
          ← Girişe dön
        </Link>
      </p>
    </>
  );
}
