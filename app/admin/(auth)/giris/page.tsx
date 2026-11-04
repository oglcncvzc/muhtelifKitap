import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/admin/ui";
import { currentAdmin } from "@/lib/admin/db";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Giriş" };

export default function LoginPage({ searchParams }: PageProps<"/admin/giris">) {
  return (
    <>
      <h1 className="text-lg font-semibold">Yönetim paneline giriş</h1>
      <p className="mt-1 mb-5 text-sm text-muted">Yönetici hesabınızın e-posta adresi ve şifresiyle giriş yapın.</p>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
        <LoginNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </>
  );
}

async function RedirectIfSignedIn() {
  if (await currentAdmin()) redirect("/admin");
  return null;
}

async function LoginNotice({ searchParams }: { searchParams: PageProps<"/admin/giris">["searchParams"] }) {
  const sp = await searchParams;
  if (sp.hata === "baglanti")
    return (
      <Notice tone="error" className="mb-4">
        Bağlantı geçersiz ya da süresi dolmuş. Gerekirse yeni bir şifre yenileme bağlantısı isteyin.
      </Notice>
    );
  if (sp.durum === "cikis")
    return (
      <Notice tone="success" className="mb-4">
        Çıkış yaptınız.
      </Notice>
    );
  if (sp.durum === "sifre")
    return (
      <Notice tone="success" className="mb-4">
        Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
      </Notice>
    );
  return null;
}
