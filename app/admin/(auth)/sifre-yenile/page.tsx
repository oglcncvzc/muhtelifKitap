import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoadingBlock, Notice } from "@/components/admin/ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NewPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Yeni şifre" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-lg font-semibold">Yeni şifre belirleyin</h1>
      <p className="mt-1 mb-5 text-sm text-muted">En az 8 karakterli yeni bir şifre girin.</p>
      <Suspense fallback={<LoadingBlock rows={2} />}>
        <ResetGate />
      </Suspense>
    </>
  );
}

async function ResetGate() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="space-y-4">
        <Notice tone="warning" title="Bağlantı geçersiz">
          Şifre yenileme bağlantısının süresi dolmuş ya da bağlantı farklı bir tarayıcıda açılmış olabilir.
        </Notice>
        <Link href="/admin/sifremi-unuttum" className="block text-center text-sm font-medium underline underline-offset-2">
          Yeni bağlantı iste
        </Link>
      </div>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm">
        Hesap: <span className="font-medium">{user.email}</span>
      </p>
      <NewPasswordForm />
    </>
  );
}
